import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Create Permissions
  const permissionsData = [
    { name: "post:create", description: "Create a new post" },
    { name: "post:delete", description: "Delete any post" },
    { name: "post:hide", description: "Hide post for moderation" },
    { name: "comment:create", description: "Post a comment" },
    { name: "comment:delete", description: "Delete any comment" },
    { name: "comment:pin", description: "Pin a comment to top" },
    { name: "ticket:create", description: "Submit an administrative ticket" },
    { name: "ticket:assign", description: "Assign ticket to staff" },
    { name: "ticket:resolve", description: "Mark ticket as resolved" },
    { name: "ticket:close", description: "Close ticket permanently" },
    { name: "user:suspend", description: "Suspend a user account" },
    { name: "user:verify", description: "Verify official accounts" },
  ];

  const permissions: Record<string, any> = {};
  for (const perm of permissionsData) {
    permissions[perm.name] = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log(`Upserted ${Object.keys(permissions).length} permissions.`);

  // 2. Create Roles
  const rolesData = [
    { name: "SUPER_ADMIN", description: "Full system administration access" },
    { name: "UNIV_ADMIN", description: "University-level administrative control" },
    { name: "DEPT_ADMIN", description: "Department-level coordinator" },
    { name: "FACULTY", description: "Academic and official staff" },
    { name: "MODERATOR", description: "Content moderation team" },
    { name: "STUDENT", description: "General university student" },
  ];

  const roles: Record<string, any> = {};
  for (const r of rolesData) {
    roles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log(`Upserted ${Object.keys(roles).length} roles.`);

  // 3. Link Roles and Permissions
  const rolePermissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: Object.keys(permissions),
    UNIV_ADMIN: [
      "post:create", "post:delete", "post:hide", "comment:create", "comment:delete",
      "ticket:create", "ticket:assign", "ticket:resolve", "ticket:close", "user:suspend", "user:verify"
    ],
    DEPT_ADMIN: [
      "post:create", "comment:create", "ticket:create", "ticket:assign", "ticket:resolve"
    ],
    FACULTY: [
      "post:create", "comment:create", "comment:pin"
    ],
    MODERATOR: [
      "post:delete", "post:hide", "comment:delete"
    ],
    STUDENT: [
      "post:create", "comment:create", "ticket:create"
    ],
  };

  for (const [roleName, permNames] of Object.entries(rolePermissionsMap)) {
    const roleId = roles[roleName].id;
    for (const permName of permNames) {
      const permissionId = permissions[permName].id;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }
  console.log("Linked roles with permissions.");

  // 4. Create University Hierarchy
  const university = await prisma.university.upsert({
    where: { domain: "echostate.edu" },
    update: {},
    create: {
      name: "Echo State University",
      domain: "echostate.edu",
    },
  });

  const department = await prisma.department.upsert({
    where: {
      name_universityId: { name: "Computer Science", universityId: university.id },
    },
    update: {},
    create: {
      name: "Computer Science",
      universityId: university.id,
    },
  });

  const program = await prisma.program.upsert({
    where: {
      name_departmentId: { name: "Bachelor of Science in CS", departmentId: department.id },
    },
    update: {},
    create: {
      name: "Bachelor of Science in CS",
      departmentId: department.id,
    },
  });

  const batch = await prisma.batch.upsert({
    where: {
      name_programId: { name: "Class of 2027", programId: program.id },
    },
    update: {},
    create: {
      name: "Class of 2027",
      programId: program.id,
    },
  });

  const classRoom = await prisma.class.upsert({
    where: {
      name_batchId: { name: "CS-101", batchId: batch.id },
    },
    update: {},
    create: {
      name: "CS-101",
      batchId: batch.id,
    },
  });

  console.log("Created University Hierarchy.");

  // 5. Create Default Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Password123!", salt);

  const usersToSeed = [
    { email: "admin@echostate.edu", roleName: "SUPER_ADMIN", firstName: "System", lastName: "Admin" },
    { email: "moderator@echostate.edu", roleName: "MODERATOR", firstName: "Alex", lastName: "Mod" },
    { email: "faculty@echostate.edu", roleName: "FACULTY", firstName: "Dr. Jane", lastName: "Smith" },
    { email: "student@echostate.edu", roleName: "STUDENT", firstName: "John", lastName: "Doe" },
  ];

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        roleId: roles[u.roleName].id,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: u.firstName,
        lastName: u.lastName,
        universityId: university.id,
        departmentId: department.id,
        programId: program.id,
        batchId: batch.id,
        classId: classRoom.id,
      },
    });

    if (u.roleName === "STUDENT") {
      // Create a default anonymous profile for the student
      await prisma.anonymousProfile.create({
        data: {
          userId: user.id,
          alias: "BlueEcho",
          avatarUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=BlueEcho",
        },
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
