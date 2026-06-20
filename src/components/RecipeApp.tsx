"use client";
import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface Recipe {
  id: string;
  name: string;
  url: string;
  ingredients: string;
  category: string;
  cookTime: number;
  memo: string;
  myRating: number;
  wantAgain: boolean;
  cookedCount: number;
  partnerRating: number;
  partnerMemo: string;
  createdAt: string;
}

// ═══════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════
const STORAGE_KEY = "recipe_secretary_v1";
const API_KEY_STORAGE = "recipe_secretary_apikey";

function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getSampleRecipes();
  } catch { return getSampleRecipes(); }
}

function saveRecipes(recipes: Recipe[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)); } catch {}
}

function getSampleRecipes(): Recipe[] {
  return [
    { id: "1", name: "鶏むね肉の照り焼き", url: "", ingredients: "鶏むね肉, 醤油, みりん, 砂糖, 生姜", category: "メイン", cookTime: 20, memo: "片栗粉をまぶすとふっくら仕上がる", myRating: 5, wantAgain: true, cookedCount: 8, partnerRating: 4, partnerMemo: "タレが美味しい", createdAt: new Date().toISOString() },
    { id: "2", name: "なすの味噌炒め", url: "", ingredients: "なす, 豚ひき肉, 味噌, みりん, 醤油, ごま油", category: "メイン", cookTime: 15, memo: "なすに油をしっかり吸わせる", myRating: 4, wantAgain: true, cookedCount: 5, partnerRating: 5, partnerMemo: "ご飯が進む！", createdAt: new Date().toISOString() },
    { id: "3", name: "大葉とトマトの冷製パスタ", url: "", ingredients: "パスタ, トマト, 大葉, にんにく, オリーブオイル, 塩", category: "麺", cookTime: 25, memo: "夏にぴったり。氷水で締める", myRating: 4, wantAgain: true, cookedCount: 3, partnerRating: 4, partnerMemo: "さっぱりして好き", createdAt: new Date().toISOString() },
  ];
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ═══════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════
const Icon = ({ name, size = 24, color = "currentColor" }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    home: <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round"/>,
    search: <><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.8" fill="none"/><path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    ai: <><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    plus: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} stroke="none"/>,
    starEmpty: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke={color} strokeWidth="1.5"/>,
    back: <path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    edit: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    check: <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    clock: <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill="none"/><path d="M12 6v6l4 2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={color} stroke="none"/>,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    link: <path d="M15 7h3a5 5 0 010 10h-3m-6 0H6A5 5 0 016 7h3m-1 5h8" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/>,
    repeat: <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    key: <><circle cx="7" cy="17" r="3" stroke={color} strokeWidth="1.8" fill="none"/><path d="M10 17h11M18 17v-2M21 17v-2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M10 14l4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0}}>{icons[name] || null}</svg>;
};

// ═══════════════════════════════════════════
// STAR RATING
// ═══════════════════════════════════════════
function StarRating({ value = 0, onChange, size = 28 }: { value?: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange?.(n)} style={{ background: "none", border: "none", padding: 2, cursor: onChange ? "pointer" : "default", color: n <= value ? "#FF6B35" : "#DDD" }}>
          <Icon name={n <= value ? "star" : "starEmpty"} size={size} color={n <= value ? "#FF6B35" : "#CCC"} />
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// CATEGORY BADGE
// ═══════════════════════════════════════════
const CATEGORIES = ["メイン","副菜","汁物","サラダ","麺","ご飯","デザート","その他"];
const CATEGORY_COLORS: Record<string, {bg:string;text:string}> = {
  "メイン":{bg:"#FFF0EA",text:"#E85D04"},"副菜":{bg:"#F0FFF4",text:"#2D6A4F"},
  "汁物":{bg:"#EEF2FF",text:"#4338CA"},"サラダ":{bg:"#F0FFF4",text:"#15803D"},
  "麺":{bg:"#FFFBEB",text:"#B45309"},"ご飯":{bg:"#FFF7F0",text:"#C2410C"},
  "デザート":{bg:"#FDF4FF",text:"#7E22CE"},"その他":{bg:"#F5F5F5",text:"#666"},
};

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS["その他"];
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.3 }}>{category}</span>;
}

// ═══════════════════════════════════════════
// RECIPE CARD
// ═══════════════════════════════════════════
function RecipeCard({ recipe, onTap }: { recipe: Recipe; onTap: (r: Recipe) => void }) {
  return (
    <button onClick={() => onTap(recipe)} style={{ background: "#FFF", borderRadius: 16, padding: 16, border: "none", textAlign: "left", width: "100%", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer", marginBottom: 12, WebkitTapHighlightColor: "transparent" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <CategoryBadge category={recipe.category} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#999", fontSize: 12 }}>
          <Icon name="clock" size={13} color="#999" /><span>{recipe.cookTime}分</span>
        </div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E", marginBottom: 8, lineHeight: 1.3 }}>{recipe.name}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRating value={recipe.myRating} size={16} />
        <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#888" }}>
          {recipe.cookedCount > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="repeat" size={12} color="#888" /> {recipe.cookedCount}回</span>}
          {recipe.wantAgain && <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#FF6B35" }}><Icon name="heart" size={12} color="#FF6B35" /> また作る</span>}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════
// FORM HELPERS
// ═══════════════════════════════════════════
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 6, letterSpacing: 0.3 }}>
        {label}{required && <span style={{ color: "#FF6B35", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #EEE",
  fontSize: 16, background: "#FAFAFA", outline: "none", boxSizing: "border-box",
  color: "#1A1A2E", fontFamily: "inherit", transition: "border-color 0.2s",
};

// ═══════════════════════════════════════════
// API KEY SETUP
// ═══════════════════════════════════════════
function ApiKeySetup({ onSaved, onBack }: { onSaved: (k: string) => void; onBack?: () => void }) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string|null>(null);

  async function handleSave() {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) { setTestError("APIキーは「sk-ant-」から始まります。コピーし直してみてください。"); return; }
    setTesting(true); setTestError(null);
    try {
      const res = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "hi", apiKey: trimmed, maxTokens: 10 }),
      });
      if (res.ok) {
        try { localStorage.setItem(API_KEY_STORAGE, trimmed); } catch {}
        onSaved(trimmed);
      } else {
        const err = await res.json();
        setTestError(`キーが無効です（${err?.error?.message || res.status}）。コピーし直してみてください。`);
      }
    } catch { setTestError("接続できませんでした。ページを再読み込みして試してください。"); }
    finally { setTesting(false); }
  }

  return (
    <div style={{ padding: "0 16px 40px" }}>
      {onBack && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "#F5F5F5", border: "none", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="back" size={20} color="#333" />
          </button>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>AI設定</div>
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B4E 100%)", borderRadius: 24, padding: "28px 24px", marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🔑</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF", marginBottom: 6 }}>AIを使うための設定</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>Anthropic APIキーを入力するだけで<br/>AI献立提案が使えるようになります</div>
      </div>
      <div style={{ background: "#FFF", borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A2E", marginBottom: 12 }}>APIキーを貼り付ける</div>
        <div style={{ position: "relative" }}>
          <input value={key} onChange={e => { setKey(e.target.value); setTestError(null); }} type={showKey ? "text" : "password"} placeholder="sk-ant-api03-..." style={{ ...inputStyle, paddingRight: 52, fontFamily: "monospace", fontSize: 14 }} />
          <button onClick={() => setShowKey(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#AAA", fontSize: 13, fontWeight: 700 }}>{showKey ? "隠す" : "表示"}</button>
        </div>
        {testError && <div style={{ marginTop: 10, background: "#FFF0EE", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#C0392B", lineHeight: 1.6 }}>⚠️ {testError}</div>}
        <div style={{ marginTop: 12, background: "#F0FFF4", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#2D6A4F", lineHeight: 1.7 }}>🔒 このキーはあなたのブラウザ内にのみ保存されます。外部サーバーには送信されません。</div>
      </div>
      <button onClick={handleSave} disabled={testing || !key.trim()} style={{ width: "100%", background: key.trim() ? "#FF6B35" : "#DDD", border: "none", borderRadius: 16, padding: 18, color: "#FFF", fontSize: 17, fontWeight: 800, cursor: key.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: key.trim() ? "0 4px 20px rgba(255,107,53,0.35)" : "none" }}>
        {testing ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> 確認中...</> : <><Icon name="check" size={22} color="#FFF" /> 保存してAIを使い始める</>}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════
function HomeScreen({ recipes, onNavigate }: { recipes: Recipe[]; onNavigate: (s: string, d?: Recipe|null) => void }) {
  const total = recipes.length;
  const avg = total ? (recipes.reduce((s,r) => s+(r.myRating||0),0)/total).toFixed(1) : 0;
  const wantAgain = recipes.filter(r => r.wantAgain).length;
  const recent = [...recipes].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,3);
  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B4E 100%)", borderRadius: 24, padding: "28px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,107,53,0.15)" }} />
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: 1 }}>今日も一緒に考えましょう</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#FFF", lineHeight: 1.2, marginBottom: 16 }}>🍳 AIレシピ秘書</div>
        <button onClick={() => onNavigate("ai")} style={{ background: "#FF6B35", border: "none", borderRadius: 14, padding: "14px 24px", color: "#FFF", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 20px rgba(255,107,53,0.4)" }}>
          <Icon name="ai" size={20} color="#FFF" />今日の献立を提案してもらう
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        {[{label:"登録レシピ",value:total,unit:"品"},{label:"平均評価",value:avg,unit:"★"},{label:"また作りたい",value:wantAgain,unit:"品"}].map(({label,value,unit}) => (
          <div key={label} style={{ background: "#FFF", borderRadius: 14, padding: "14px 10px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#FF6B35" }}>{value}<span style={{ fontSize: 12 }}>{unit}</span></div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A2E" }}>最近登録したレシピ</div>
        <button onClick={() => onNavigate("list")} style={{ background: "none", border: "none", color: "#FF6B35", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>すべて見る</button>
      </div>
      {recent.map(r => <RecipeCard key={r.id} recipe={r} onTap={() => onNavigate("detail", r)} />)}
      <button onClick={() => onNavigate("add")} style={{ width: "100%", background: "#FFF8F5", border: "2px dashed #FFCAB3", borderRadius: 16, padding: 18, color: "#FF6B35", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="plus" size={20} color="#FF6B35" />新しいレシピを登録する
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// LIST SCREEN
// ═══════════════════════════════════════════
function ListScreen({ recipes, onNavigate }: { recipes: Recipe[]; onNavigate: (s: string, d?: Recipe|null) => void }) {
  const [filter, setFilter] = useState("すべて");
  const filtered = filter === "すべて" ? recipes : recipes.filter(r => r.category === filter);
  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", marginBottom: 16 }}>レシピ一覧 <span style={{ fontSize: 15, color: "#999", fontWeight: 400 }}>{filtered.length}品</span></div>
      <div style={{ overflowX: "auto", marginBottom: 20, paddingBottom: 4, display: "flex", gap: 8, scrollbarWidth: "none" as const }}>
        {["すべて",...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ background: filter===cat ? "#1A1A2E" : "#FFF", color: filter===cat ? "#FFF" : "#666", border: filter===cat ? "none" : "2px solid #EEE", borderRadius: 24, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{cat}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#AAA" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>まだレシピがありません</div>
          <button onClick={() => onNavigate("add")} style={{ marginTop: 20, background: "#FF6B35", color: "#FFF", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>登録する</button>
        </div>
      ) : filtered.map(r => <RecipeCard key={r.id} recipe={r} onTap={() => onNavigate("detail", r)} />)}
    </div>
  );
}

// ═══════════════════════════════════════════
// SEARCH SCREEN
// ═══════════════════════════════════════════
function SearchScreen({ recipes, onNavigate }: { recipes: Recipe[]; onNavigate: (s: string, d?: Recipe|null) => void }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", minRating: 0, maxTime: 999 });
  const results = recipes.filter(r => {
    const mq = !query || r.name.includes(query) || r.ingredients.includes(query);
    const mc = !filters.category || r.category === filters.category;
    const mr = r.myRating >= filters.minRating;
    const mt = r.cookTime <= filters.maxTime;
    return mq && mc && mr && mt;
  });
  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", marginBottom: 16 }}>検索</div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="料理名・食材で検索..." style={{ ...inputStyle, paddingLeft: 42 }} />
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" as const }}><Icon name="search" size={18} color="#BBB" /></div>
      </div>
      <div style={{ background: "#FFF", borderRadius: 16, padding: 16, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 12 }}>絞り込み</div>
        <FormField label="カテゴリ">
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {["すべて",...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilters(f => ({...f, category: cat==="すべて" ? "" : cat}))} style={{ background: (cat==="すべて" ? !filters.category : filters.category===cat) ? "#1A1A2E" : "#F5F5F5", color: (cat==="すべて" ? !filters.category : filters.category===cat) ? "#FFF" : "#555", border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{cat}</button>
            ))}
          </div>
        </FormField>
        <FormField label={`調理時間 〜 ${filters.maxTime>=999 ? "制限なし" : filters.maxTime+"分"}`}>
          <input type="range" min={5} max={60} step={5} value={filters.maxTime>=999?60:filters.maxTime} onChange={e => setFilters(f => ({...f, maxTime: +e.target.value===60 ? 999 : +e.target.value}))} style={{ width: "100%", accentColor: "#FF6B35" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#AAA", marginTop: 2 }}><span>5分</span><span>30分</span><span>60分+</span></div>
        </FormField>
        <FormField label="自分評価（以上）">
          <StarRating value={filters.minRating} onChange={v => setFilters(f => ({...f, minRating: v===f.minRating?0:v}))} size={28} />
        </FormField>
      </div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 12 }}>{results.length}件見つかりました</div>
      {results.map(r => <RecipeCard key={r.id} recipe={r} onTap={() => onNavigate("detail", r)} />)}
    </div>
  );
}

// ═══════════════════════════════════════════
// AI SCREEN
// ═══════════════════════════════════════════
function AiScreen({ recipes, apiKey, onNeedApiKey }: { recipes: Recipe[]; apiKey: string; onNeedApiKey: () => void }) {
  const [situation, setSituation] = useState("");
  const [result, setResult] = useState<{message:string;proposals:{name:string;reason:string;tip:string}[]}|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const QUICK = ["疲れていてなるべく楽に作りたい","20分以内で作れるもの","ガッツリ食べたい気分","さっぱりしたものが食べたい","野菜を使いたい","パートナーが喜ぶものを作りたい"];

  if (!apiKey) return <ApiKeySetup onSaved={onNeedApiKey} />;

  async function propose() {
    if (!situation.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const ctx = recipes.map(r => `【${r.name}】カテゴリ:${r.category} 調理:${r.cookTime}分 食材:${r.ingredients} 自分評価:${r.myRating}★ パートナー評価:${r.partnerRating||"未"}★ 回数:${r.cookedCount}回 また作りたい:${r.wantAgain?"はい":"いいえ"} メモ:${r.memo}`).join("\n");
      const prompt = `あなたはユーザーの専属AIレシピ秘書です。以下は登録済みレシピです：\n${ctx}\n\nユーザーの今日の状況：「${situation}」\n\n登録済みレシピの中から最適な献立を2〜3品提案してください。\n\n以下のJSON形式のみで返答（他テキスト不要）：\n{"proposals":[{"name":"レシピ名","reason":"理由50字以内","tip":"アドバイス30字以内"}],"message":"ひとこと50字以内"}`;
      const res = await fetch("/api/propose", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ prompt, apiKey }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "API error");
      const text = data.content?.map((b: {text?:string}) => b.text||"").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult(parsed);
    } catch(e) { setError(`提案の取得に失敗しました。${ e instanceof Error ? e.message : ""}`); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ background: "linear-gradient(135deg,#1A1A2E 0%,#2D1B4E 100%)", borderRadius: 24, padding: 24, marginBottom: 24, textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🤖</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#FFF", marginBottom: 4 }}>今日の献立を提案</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>あなたのレシピから最適な一品を選びます</div>
        <button onClick={onNeedApiKey} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "5px 10px", color: "rgba(255,255,255,0.7)", fontSize: 11, cursor: "pointer" }}>🔑 キー変更</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10 }}>よく使う状況</div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
          {QUICK.map(q => <button key={q} onClick={() => setSituation(p => p ? p+"、"+q : q)} style={{ background: "#FFF8F5", border: "2px solid #FFCAB3", borderRadius: 20, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#FF6B35", cursor: "pointer" }}>{q}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 8 }}>今日の状況・食材を教えてください</div>
        <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder={"例：鶏肉とナスがある。疲れていて20分以内で作りたい。\n食材・気分・時間など何でもOK"} rows={4} style={{ ...inputStyle, resize: "none" as const, lineHeight: 1.6 }} />
      </div>
      <button onClick={propose} disabled={loading||!situation.trim()} style={{ width: "100%", background: situation.trim() ? "#FF6B35" : "#DDD", border: "none", borderRadius: 16, padding: 16, color: "#FFF", fontSize: 17, fontWeight: 800, cursor: situation.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
        {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> AIが考えています...</> : <><Icon name="send" size={20} color="#FFF" /> 献立を提案してもらう</>}
      </button>
      {error && <div style={{ background: "#FFF0EE", border: "2px solid #FFCAB3", borderRadius: 16, padding: 16, color: "#C0392B", fontSize: 14, marginBottom: 16 }}>⚠️ {error}</div>}
      {result && (
        <div>
          <div style={{ background: "#F0F7FF", borderRadius: 16, padding: "14px 16px", marginBottom: 16, fontSize: 15, color: "#1A1A2E", fontWeight: 600, lineHeight: 1.5 }}>💬 {result.message}</div>
          {result.proposals?.map((p, i) => (
            <div key={i} style={{ background: "#FFF", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 14, borderLeft: "4px solid #FF6B35" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ background: "#FF6B35", color: "#FFF", borderRadius: 8, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{i+1}</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>{p.name}</div>
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>{p.reason}</div>
              <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#92400E", fontWeight: 600 }}>💡 {p.tip}</div>
            </div>
          ))}
        </div>
      )}
      {recipes.length===0 && !result && <div style={{ background: "#FFF8F5", borderRadius: 16, padding: 20, textAlign: "center", color: "#AAA" }}><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div><div style={{ fontSize: 14, fontWeight: 700 }}>レシピが登録されていません</div></div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// DETAIL SCREEN
// ═══════════════════════════════════════════
function DetailScreen({ recipe, onBack, onEdit, onDelete }: { recipe: Recipe; onBack: ()=>void; onEdit: ()=>void; onDelete: ()=>void }) {
  return (
    <div style={{ padding: "0 16px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "#F5F5F5", border: "none", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="back" size={20} color="#333" /></button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E", flex: 1, lineHeight: 1.3 }}>{recipe.name}</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <CategoryBadge category={recipe.category} />
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#888" }}><Icon name="clock" size={13} color="#888" />{recipe.cookTime}分</span>
      </div>
      {recipe.url && <a href={recipe.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "#EEF2FF", borderRadius: 12, padding: "12px 14px", marginBottom: 16, color: "#4338CA", textDecoration: "none", fontSize: 13, fontWeight: 700 }}><Icon name="link" size={16} color="#4338CA" /> レシピのURLを開く</a>}
      {[{title:"🥕 食材",content:recipe.ingredients}, recipe.memo?{title:"📝 メモ",content:recipe.memo}:null].filter(Boolean).map(sec => (
        <div key={sec!.title} style={{ background: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 8 }}>{sec!.title}</div>
          <div style={{ fontSize: 15, color: "#333", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{sec!.content}</div>
        </div>
      ))}
      <div style={{ background: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 12 }}>⭐ 自分の評価</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 14, color: "#444" }}>お気に入り度</span><StarRating value={recipe.myRating} size={22} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 14, color: "#444" }}>また作りたい</span><span style={{ fontSize: 14, fontWeight: 700, color: recipe.wantAgain?"#FF6B35":"#AAA" }}>{recipe.wantAgain?"❤️ はい":"— いいえ"}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 14, color: "#444" }}>作った回数</span><span style={{ fontSize: 14, fontWeight: 700 }}>{recipe.cookedCount}回</span></div>
      </div>
      {(recipe.partnerRating>0||recipe.partnerMemo) && (
        <div style={{ background: "#FFF", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 12 }}>💑 パートナー評価</div>
          {recipe.partnerRating>0 && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 14, color: "#444" }}>評価</span><StarRating value={recipe.partnerRating} size={22} /></div>}
          {recipe.partnerMemo && <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6, background: "#F9F9F9", padding: "10px 12px", borderRadius: 10 }}>💬 {recipe.partnerMemo}</div>}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
        <button onClick={onEdit} style={{ background: "#1A1A2E", border: "none", borderRadius: 14, padding: 14, color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="edit" size={18} color="#FFF" /> 編集</button>
        <button onClick={onDelete} style={{ background: "#FFF0EE", border: "2px solid #FFCAB3", borderRadius: 14, padding: 14, color: "#E85D04", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="trash" size={18} color="#E85D04" /> 削除</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ADD/EDIT SCREEN
// ═══════════════════════════════════════════
function AddEditScreen({ initial, onSave, onBack }: { initial?: Recipe|null; onSave: (r: Recipe) => void; onBack: () => void }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<Recipe>(initial || { id:"", name:"", url:"", ingredients:"", category:"メイン", cookTime:30, memo:"", myRating:3, wantAgain:true, cookedCount:0, partnerRating:0, partnerMemo:"", createdAt:"" });
  const set = (key: keyof Recipe, val: Recipe[keyof Recipe]) => setForm(f => ({...f,[key]:val}));

  function handleSave() {
    if (!form.name.trim()) { alert("レシピ名を入力してください"); return; }
    if (!form.ingredients.trim()) { alert("食材を入力してください"); return; }
    onSave({...form, id: form.id||generateId(), createdAt: form.createdAt||new Date().toISOString()});
  }

  return (
    <div style={{ padding: "0 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "#F5F5F5", border: "none", borderRadius: 12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="back" size={20} color="#333" /></button>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E" }}>{isEdit?"レシピを編集":"レシピを登録"}</div>
      </div>
      {[
        { title: "基本情報", fields: (
          <>
            <FormField label="レシピ名" required><input value={form.name} onChange={e => set("name",e.target.value)} placeholder="例：鶏むね肉の照り焼き" style={inputStyle} /></FormField>
            <FormField label="URL（任意）"><input value={form.url} onChange={e => set("url",e.target.value)} placeholder="https://..." type="url" style={inputStyle} /></FormField>
            <FormField label="食材" required><textarea value={form.ingredients} onChange={e => set("ingredients",e.target.value)} placeholder="例：鶏むね肉, 醤油, みりん" rows={3} style={{...inputStyle,resize:"none" as const,lineHeight:1.6}} /></FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="カテゴリ"><select value={form.category} onChange={e => set("category",e.target.value)} style={{...inputStyle,appearance:"none" as const}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></FormField>
              <FormField label="調理時間（分）"><input value={form.cookTime} onChange={e => set("cookTime",+e.target.value)} type="number" min={1} max={180} style={inputStyle} /></FormField>
            </div>
            <FormField label="メモ"><textarea value={form.memo} onChange={e => set("memo",e.target.value)} placeholder="コツや気づきをメモ..." rows={3} style={{...inputStyle,resize:"none" as const,lineHeight:1.6}} /></FormField>
          </>
        )},
        { title: "自分の評価", fields: (
          <>
            <FormField label="お気に入り度"><StarRating value={form.myRating} onChange={v => set("myRating",v)} size={32} /></FormField>
            <FormField label="また作りたい">
              <div style={{ display: "flex", gap: 10 }}>
                {([true,false] as const).map(v => <button key={String(v)} onClick={() => set("wantAgain",v)} style={{ flex:1, padding:12, borderRadius:12, border:"2px solid", borderColor:form.wantAgain===v?"#FF6B35":"#EEE", background:form.wantAgain===v?"#FFF8F5":"#FFF", color:form.wantAgain===v?"#FF6B35":"#888", fontSize:14, fontWeight:700, cursor:"pointer" }}>{v?"❤️ はい":"いいえ"}</button>)}
              </div>
            </FormField>
            <FormField label="作った回数">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => set("cookedCount",Math.max(0,form.cookedCount-1))} style={{ width:44,height:44,borderRadius:12,border:"2px solid #EEE",background:"#FFF",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
                <span style={{ fontSize:22,fontWeight:800,color:"#1A1A2E",minWidth:40,textAlign:"center" as const }}>{form.cookedCount}</span>
                <button onClick={() => set("cookedCount",form.cookedCount+1)} style={{ width:44,height:44,borderRadius:12,border:"2px solid #EEE",background:"#FFF",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>＋</button>
              </div>
            </FormField>
          </>
        )},
        { title: "パートナー評価（任意）", fields: (
          <>
            <FormField label="評価"><StarRating value={form.partnerRating} onChange={v => set("partnerRating",v)} size={32} /></FormField>
            <FormField label="感想メモ"><input value={form.partnerMemo} onChange={e => set("partnerMemo",e.target.value)} placeholder="パートナーの感想..." style={inputStyle} /></FormField>
          </>
        )},
      ].map(({title,fields}) => (
        <div key={title} style={{ background:"#FFF",borderRadius:20,padding:20,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:14,fontWeight:800,color:"#FF6B35",marginBottom:16 }}>{title}</div>
          {fields}
        </div>
      ))}
      <button onClick={handleSave} style={{ width:"100%",background:"#FF6B35",border:"none",borderRadius:16,padding:18,color:"#FFF",fontSize:17,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 20px rgba(255,107,53,0.35)" }}>
        <Icon name="check" size={22} color="#FFF" />{isEdit?"変更を保存する":"レシピを登録する"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// BOTTOM NAV & FAB
// ═══════════════════════════════════════════
function BottomNav({ current, onNavigate }: { current: string; onNavigate: (s: string) => void }) {
  const tabs = [{id:"home",icon:"home",label:"ホーム"},{id:"list",icon:"list",label:"一覧"},{id:"search",icon:"search",label:"検索"},{id:"ai",icon:"ai",label:"AI提案"}];
  return (
    <div style={{ position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",background:"#FFF",borderTop:"1px solid #EEE",display:"grid",gridTemplateColumns:"repeat(4,1fr)",paddingBottom:"env(safe-area-inset-bottom,16px)",boxShadow:"0 -4px 20px rgba(0,0,0,0.07)",zIndex:100 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNavigate(t.id)} style={{ background:"none",border:"none",padding:"10px 0 6px",display:"flex",flexDirection:"column" as const,alignItems:"center",gap:3,cursor:"pointer",color:current===t.id?"#FF6B35":"#AAA",WebkitTapHighlightColor:"transparent" }}>
          <Icon name={t.icon} size={24} color={current===t.id?"#FF6B35":"#AAA"} />
          <span style={{ fontSize:10,fontWeight:700,letterSpacing:0.3 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ position:"fixed",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",right:20,width:56,height:56,borderRadius:"50%",background:"#FF6B35",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 24px rgba(255,107,53,0.45)",zIndex:99 }}>
      <Icon name="plus" size={28} color="#FFF" />
    </button>
  );
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
export default function RecipeApp() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [screen, setScreen] = useState("home");
  const [screenData, setScreenData] = useState<Recipe|null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRecipes(loadRecipes());
    try { setApiKey(localStorage.getItem(API_KEY_STORAGE)||""); } catch {}
    setMounted(true);
  }, []);

  useEffect(() => { if (mounted) saveRecipes(recipes); }, [recipes, mounted]);

  const navigate = useCallback((to: string, data: Recipe|null = null) => {
    setScreen(to); setScreenData(data); setShowApiSetup(false); window.scrollTo(0,0);
  }, []);

  function handleSave(recipe: Recipe) {
    setRecipes(prev => { const ex = prev.find(r => r.id===recipe.id); return ex ? prev.map(r => r.id===recipe.id?recipe:r) : [...prev,recipe]; });
    navigate("home");
  }

  function handleDelete(recipe: Recipe) {
    if (!window.confirm(`「${recipe.name}」を削除しますか？`)) return;
    setRecipes(prev => prev.filter(r => r.id!==recipe.id));
    navigate("list");
  }

  function handleApiKeySaved(key: string) { setApiKey(key); setShowApiSetup(false); setScreen("ai"); }

  if (!mounted) return null;

  const mainScreens = ["home","list","search","ai"];
  const showNav = mainScreens.includes(screen) && !showApiSetup;
  const showFAB = ["home","list"].includes(screen) && !showApiSetup;

  return (
    <div style={{ fontFamily:"-apple-system,'Hiragino Sans','Noto Sans JP',sans-serif",background:"#F7F3EE",minHeight:"100dvh",maxWidth:430,margin:"0 auto",position:"relative" }}>
      <style>{`*{box-sizing:border-box;-webkit-font-smoothing:antialiased;}body{margin:0;background:#F7F3EE;}input:focus,textarea:focus,select:focus{border-color:#FF6B35!important;background:#FFF!important;}@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{display:none}`}</style>
      <div style={{ paddingTop:"calc(env(safe-area-inset-top,0px) + 20px)", paddingBottom: showNav?"90px":"0" }}>
        {showApiSetup ? (
          <ApiKeySetup onSaved={handleApiKeySaved} onBack={() => setShowApiSetup(false)} />
        ) : (
          <>
            {screen==="home" && <HomeScreen recipes={recipes} onNavigate={navigate} />}
            {screen==="list" && <ListScreen recipes={recipes} onNavigate={navigate} />}
            {screen==="search" && <SearchScreen recipes={recipes} onNavigate={navigate} />}
            {screen==="ai" && <AiScreen recipes={recipes} apiKey={apiKey} onNeedApiKey={() => setShowApiSetup(true)} />}
            {screen==="detail" && screenData && <DetailScreen recipe={screenData} onBack={() => navigate("list")} onEdit={() => navigate("add",screenData)} onDelete={() => handleDelete(screenData)} />}
            {screen==="add" && <AddEditScreen initial={screenData} onSave={handleSave} onBack={() => navigate(screenData?"detail":"list",screenData)} />}
          </>
        )}
      </div>
      {showNav && <BottomNav current={screen} onNavigate={navigate} />}
      {showFAB && <FAB onClick={() => navigate("add")} />}
    </div>
  );
}
