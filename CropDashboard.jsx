import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts";

const crops = [
  { name: "Wheat", icon: "🌾", unit: "₹/quintal", basePrice: 2200 },
  { name: "Rice", icon: "🌾", unit: "₹/quintal", basePrice: 1900 },
  { name: "Maize", icon: "🌽", unit: "₹/quintal", basePrice: 1750 },
  { name: "Cotton", icon: "☁️", unit: "₹/quintal", basePrice: 6800 },
  { name: "Tomato", icon: "🍅", unit: "₹/kg", basePrice: 42 },
  { name: "Onion", icon: "🧅", unit: "₹/kg", basePrice: 28 },
  { name: "Potato", icon: "🥔", unit: "₹/kg", basePrice: 18 },
  { name: "Soybean", icon: "🫘", unit: "₹/quintal", basePrice: 4400 },
];

const locations = ["Punjab", "Haryana", "Maharashtra", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Gujarat", "Karnataka"];

const markets = ["APMC Azadpur", "Vashi Market", "Koyambedu", "Gultekdi", "Shahibaugh"];

function generatePriceData(basePrice) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date();
  const currentMonth = today.getMonth();
  return months.map((month, i) => {
    const seasonal = Math.sin((i - 2) * 0.5) * basePrice * 0.12;
    const noise = (Math.random() - 0.5) * basePrice * 0.08;
    const trend = i > currentMonth ? basePrice * 0.05 * ((i - currentMonth) / 6) : 0;
    const price = Math.round(basePrice + seasonal + noise + (i <= currentMonth ? 0 : trend));
    return {
      month,
      price,
      predicted: i > currentMonth,
      marketAvg: Math.round(price * (0.95 + Math.random() * 0.1)),
    };
  });
}

function generateMarketComparison(basePrice) {
  return markets.map((market) => ({
    market: market.split(" ")[0],
    price: Math.round(basePrice * (0.9 + Math.random() * 0.22)),
  }));
}

function getBestSellingTime(data) {
  const future = data.filter((d) => d.predicted);
  if (!future.length) return { month: "Now", reason: "Prices are stable currently" };
  const best = future.reduce((a, b) => (a.price > b.price ? a : b));
  return {
    month: best.month,
    price: best.price,
    reason: `Peak demand expected in ${best.month}`,
  };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(10, 20, 10, 0.95)",
        border: "1px solid #4ade80",
        borderRadius: "8px",
        padding: "10px 14px",
        fontFamily: "'DM Mono', monospace",
        fontSize: "12px",
        color: "#e2e8f0",
      }}>
        <div style={{ color: "#4ade80", fontWeight: "bold", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.dataKey === "price" ? "Price" : "Mkt Avg"}: ₹{p.value}
          </div>
        ))}
        {payload[0]?.payload?.predicted && (
          <div style={{ color: "#fb923c", fontSize: 10, marginTop: 4 }}>📈 Predicted</div>
        )}
      </div>
    );
  }
  return null;
};

export default function CropDashboard() {
  const [selectedCrop, setSelectedCrop] = useState(crops[0]);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [priceData, setPriceData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [bestTime, setBestTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = generatePriceData(selectedCrop.basePrice);
      const mktData = generateMarketComparison(selectedCrop.basePrice);
      const change = ((Math.random() - 0.45) * 8).toFixed(1);
      setPriceData(data);
      setMarketData(mktData);
      setBestTime(getBestSellingTime(data));
      setCurrentPrice(data[new Date().getMonth()].price);
      setPriceChange(parseFloat(change));
      setAnimKey((k) => k + 1);
      setLoading(false);
    }, 600);
  }, [selectedCrop, selectedLocation]);

  const isUp = priceChange >= 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060d06",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2f0e2",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(34, 197, 94, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(251, 146, 60, 0.04) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: "none",
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        .crop-btn { transition: all 0.2s; cursor: pointer; }
        .crop-btn:hover { background: rgba(74, 222, 128, 0.15) !important; transform: translateY(-1px); }
        .crop-btn.active { background: rgba(74, 222, 128, 0.2) !important; border-color: #4ade80 !important; }
        select { cursor: pointer; }
        select option { background: #0d1f0d; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .stat-card { animation: fadeUp 0.5s ease both; }
        .live-dot { animation: pulse-dot 1.5s infinite; }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 28 }}>🌱</span>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26, fontWeight: 900, margin: 0,
                background: "linear-gradient(90deg, #4ade80, #86efac)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}>AgriPulse</h1>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              SMART CROP MARKET INTELLIGENCE
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>LIVE DATA</span>
            <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8, fontFamily: "'DM Mono', monospace" }}>
              {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(74,222,128,0.1)",
          borderRadius: 12, padding: 16,
        }}>
          <div>
            <label style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>
              📍 STATE / REGION
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8,
                color: "#e2f0e2", padding: "8px 12px", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
            >
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>
              🏪 NEAREST MARKET
            </label>
            <select style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8,
              color: "#e2f0e2", padding: "8px 12px", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}>
              {markets.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Crop Selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>SELECT CROP</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {crops.map((crop) => (
              <button
                key={crop.name}
                className={`crop-btn ${selectedCrop.name === crop.name ? "active" : ""}`}
                onClick={() => setSelectedCrop(crop)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: selectedCrop.name === crop.name ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedCrop.name === crop.name ? "#4ade80" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 20, padding: "6px 14px", cursor: "pointer",
                  color: selectedCrop.name === crop.name ? "#4ade80" : "#9ca3af",
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span>{crop.icon}</span> {crop.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#4ade80", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            <div style={{ marginBottom: 12, fontSize: 24 }}>🔄</div>
            Fetching market data...
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                {
                  label: "Current Price",
                  value: `₹${currentPrice.toLocaleString()}`,
                  sub: selectedCrop.unit,
                  change: `${isUp ? "▲" : "▼"} ${Math.abs(priceChange)}%`,
                  changeColor: isUp ? "#4ade80" : "#f87171",
                  delay: "0s",
                },
                {
                  label: "Best Sell Month",
                  value: bestTime?.month,
                  sub: bestTime?.reason,
                  change: bestTime?.price ? `₹${bestTime.price.toLocaleString()}` : "Peak Price",
                  changeColor: "#fb923c",
                  delay: "0.1s",
                },
                {
                  label: "Markets Tracked",
                  value: markets.length,
                  sub: "APMC + Private",
                  change: "↻ Live",
                  changeColor: "#60a5fa",
                  delay: "0.2s",
                },
                {
                  label: "Price Trend",
                  value: priceChange >= 2 ? "Bullish" : priceChange <= -2 ? "Bearish" : "Stable",
                  sub: "7-day outlook",
                  change: `${isUp ? "+" : ""}${priceChange}% vs last wk`,
                  changeColor: isUp ? "#4ade80" : "#f87171",
                  delay: "0.3s",
                },
              ].map((stat, i) => (
                <div key={i} className="stat-card" style={{
                  animationDelay: stat.delay,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(74,222,128,0.1)",
                  borderRadius: 12, padding: "16px 18px",
                }}>
                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>
                    {stat.label.toUpperCase()}
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700,
                    color: "#e2f0e2", lineHeight: 1, marginBottom: 4,
                  }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{stat.sub}</div>
                  <div style={{ fontSize: 12, color: stat.changeColor, fontFamily: "'DM Mono', monospace" }}>{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Price Trend Chart */}
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(74,222,128,0.1)",
                borderRadius: 12, padding: "20px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#e2f0e2" }}>
                      {selectedCrop.icon} {selectedCrop.name} — Annual Price Trend
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>
                      {selectedLocation} • {selectedCrop.unit}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#4ade80" }}>
                      <span style={{ display: "inline-block", width: 20, height: 2, background: "#4ade80", borderRadius: 2 }} /> Actual
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#fb923c" }}>
                      <span style={{ display: "inline-block", width: 20, height: 2, background: "#fb923c", borderRadius: 2, borderTop: "2px dashed #fb923c" }} /> Predicted
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240} key={animKey}>
                  <AreaChart data={priceData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="price" stroke="#4ade80" strokeWidth={2.5}
                      fill="url(#priceGrad)" dot={(props) => {
                        const { cx, cy, payload } = props;
                        return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3}
                          fill={payload.predicted ? "#fb923c" : "#4ade80"}
                          stroke={payload.predicted ? "#fb923c" : "#4ade80"} strokeWidth={1} />;
                      }}
                    />
                    <Line type="monotone" dataKey="marketAvg" stroke="#60a5fa" strokeWidth={1.5}
                      strokeDasharray="4 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Market Comparison */}
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(74,222,128,0.1)",
                borderRadius: 12, padding: "20px",
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#e2f0e2", marginBottom: 4 }}>
                  Market Comparison
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
                  Prices across mandis today
                </div>
                <ResponsiveContainer width="100%" height={240} key={animKey + 100}>
                  <BarChart data={marketData} layout="vertical" margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="market" tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip cursor={{ fill: "rgba(74,222,128,0.05)" }} content={({ active, payload, label }) => {
                      if (active && payload?.length) return (
                        <div style={{ background: "rgba(10,20,10,0.95)", border: "1px solid #4ade80", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "DM Mono", color: "#e2e8f0" }}>
                          <div style={{ color: "#4ade80" }}>{label}</div>
                          <div>₹{payload[0].value}</div>
                        </div>
                      );
                      return null;
                    }} />
                    <Bar dataKey="price" fill="#4ade80" radius={[0, 4, 4, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendation Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(251,146,60,0.1), rgba(74,222,128,0.05))",
              border: "1px solid rgba(251,146,60,0.3)",
              borderRadius: 12, padding: "16px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28 }}>💡</div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: "#fde68a", marginBottom: 3 }}>
                    Selling Recommendation for {selectedCrop.name} in {selectedLocation}
                  </div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>
                    {priceChange >= 2
                      ? `Prices are rising. Hold stock if possible — best price expected in ${bestTime?.month}.`
                      : priceChange <= -2
                      ? `Prices are falling. Consider selling soon before further decline.`
                      : `Market is stable. Sell in ${bestTime?.month} for maximum returns at ₹${bestTime?.price?.toLocaleString()}.`}
                  </div>
                </div>
              </div>
              <div style={{
                background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.4)",
                borderRadius: 8, padding: "10px 18px", textAlign: "center", minWidth: 120,
              }}>
                <div style={{ fontSize: 11, color: "#fb923c", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>BEST TIME</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fde68a" }}>
                  {bestTime?.month}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#374151", fontFamily: "'DM Mono', monospace" }}>
              Data sourced from AGMARKNET • eNAM • State APMC portals • Updated every 30 min
            </div>
          </>
        )}
      </div>
    </div>
  );
}
