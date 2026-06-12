"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShoppingBag, Plus, Tag, Compass, Sparkles } from "lucide-react";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  imageUrl?: string;
  seller: { profile: { firstName: string; lastName: string } };
  status: string;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Listing Form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [imageUrl, setImageUrl] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.get<MarketplaceItem[]>("/campus/marketplace");
      setItems(data);
    } catch (e) {
      console.error("Failed to load marketplace items:", e);
      setItems(getMockItems());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) return;

    try {
      const image = imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";
      await api.post("/campus/marketplace", {
        title,
        description,
        price: parseFloat(price),
        condition,
        imageUrl: image,
      });
      setTitle("");
      setDescription("");
      setPrice("");
      setCondition("GOOD");
      setImageUrl("");
      setShowCreate(false);
      fetchItems();
    } catch (err: any) {
      alert("Failed to post listing: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Campus Marketplace <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">Student Deals</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Buy and sell books, furniture, or tech locally within your campus.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Listing
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateListing} className="glass-panel border border-dark-border p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Post an Item for Sale</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Item Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus 10th Edition Textbook"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Price ($ USD)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none appearance-none"
              >
                <option value="NEW">Brand New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good / Light Wear</option>
                <option value="FAIR">Fair / Used</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Image URL (optional)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo..."
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide item specifications, pickup details, or contact options..."
              rows={3}
              className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs text-white placeholder-text-muted focus:border-brand-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-dark-border text-xs font-semibold text-text-secondary hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl"
            >
              Submit Listing
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel border border-dark-border rounded-2xl h-56 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass-panel border border-dark-border rounded-2xl overflow-hidden hover:border-dark-border/80 transition-colors flex flex-col justify-between">
              {item.imageUrl && (
                <div className="h-32 bg-dark-surface border-b border-dark-border relative overflow-hidden">
                  <img src={item.imageUrl} alt="Item" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-brand-primary text-[9px] font-bold uppercase tracking-wider text-white">
                    {item.condition.replace("_", " ")}
                  </span>
                </div>
              )}

              <div className="p-4 space-y-2 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">{item.title}</h3>
                  <span className="text-xs font-extrabold text-brand-accent shrink-0 flex items-center gap-0.5 leading-none">
                    <Tag className="w-3.5 h-3.5" /> ${item.price}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              <div className="p-4 border-t border-dark-border/40 bg-dark-surface/30 flex items-center justify-between text-[10px] text-text-muted font-semibold">
                <span>Seller: {item.seller.profile.firstName}</span>
                <span className="text-brand-primary">Available</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getMockItems(): MarketplaceItem[] {
  return [
    {
      id: "item-1",
      title: "Scientific Calculator TI-84 Plus",
      description: "Like new Texas Instruments graphing calculator. Used for one semester, battery works perfectly.",
      price: 60,
      condition: "LIKE_NEW",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      seller: { profile: { firstName: "Sarah", lastName: "C" } },
      status: "AVAILABLE"
    },
    {
      id: "item-2",
      title: "CS Textbook - Introduction to Algorithms",
      description: "CLRS 3rd Edition. Very light highlight markings on chapters 2 and 4. Cover has a tiny dent.",
      price: 25,
      condition: "GOOD",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      seller: { profile: { firstName: "John", lastName: "D" } },
      status: "AVAILABLE"
    }
  ];
}
