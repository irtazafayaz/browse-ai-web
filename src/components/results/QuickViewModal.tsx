"use client";
import Image from "next/image";
import { X, Bookmark, BookmarkCheck, Zap } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Product } from "@/lib/types";

interface Props {
  product: Product | null;
  onClose: () => void;
  onBookmark: (id: string) => void;
  onViewDetails: (id: string) => void;
  isAuthed: boolean;
  onAuthRequired: () => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onBookmark,
  onViewDetails,
  isAuthed,
  onAuthRequired,
}: Props) {
  return (
    <AnimatePresence>
      {product && (
        <>
          <div
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999999,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              zIndex: 1000000,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "min(100%, 420px)",
                height: "min(100%, 80vh)",
                aspectRatio: "4/5",
                backgroundColor: "#FAFAF8",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                pointerEvents: "auto",
                zIndex: 1000001,
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "linear-gradient(145deg, #EDE8E0 0%, #DDD5C6 100%)",
                    }}
                  >
                    <Zap size={60} style={{ color: "#9B8877", opacity: 0.4 }} />
                  </div>
                )}

                <div
                  style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.1) 100%)",
                  }}
                />

                <button
                  onClick={onClose}
                  style={{
                    position: "absolute", top: "16px", right: "16px",
                    width: "40px", height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "none", cursor: "pointer", zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <X size={18} style={{ color: "#1A1A1A" }} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthed) { onAuthRequired(); return; }
                    onBookmark(product.id);
                  }}
                  style={{
                    position: "absolute", bottom: "16px", left: "16px",
                    width: "40px", height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {product.isBookmarked ? (
                    <BookmarkCheck size={18} style={{ color: "#7A9E74" }} />
                  ) : (
                    <Bookmark size={18} style={{ color: "#1A1A1A" }} />
                  )}
                </button>

                {product.originalPrice && (
                  <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                    <span
                      style={{
                        fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "6px 12px", borderRadius: "50px",
                        backgroundColor: "rgba(26, 26, 26, 0.85)",
                        color: "white",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onViewDetails(product.id)}
                  style={{
                    position: "absolute", bottom: "16px", right: "16px",
                    padding: "8px 16px",
                    fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em",
                    textTransform: "uppercase", borderRadius: "50px",
                    backgroundColor: "rgba(26, 26, 26, 0.9)",
                    color: "white",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
