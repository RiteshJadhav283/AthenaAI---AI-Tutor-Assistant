import { useState } from "react";
import { 
  Coins, 
  Gift, 
  Trophy, 
  Star, 
  Crown, 
  Zap,
  CheckCircle,
  ShoppingCart,
  Sparkles
} from "lucide-react";

const storeItems = [
  {
    id: 1,
    name: "Premium AI Tutor Access",
    description: "Unlock advanced AI tutoring features for 1 month",
    price: 500,
    category: "premium",
    icon: Crown,
    popular: true
  },
  {
    id: 2,
    name: "Unlimited Doubts",
    description: "Ask unlimited questions for 7 days",
    price: 200,
    category: "features",
    icon: Zap
  },
  {
    id: 3,
    name: "Certificate of Achievement",
    description: "Digital certificate for completing a course",
    price: 150,
    category: "rewards",
    icon: Trophy
  },
  {
    id: 4,
    name: "Custom Study Plan",
    description: "Personalized study plan based on your goals",
    price: 300,
    category: "features",
    icon: Star
  },
  {
    id: 5,
    name: "Virtual Badge Collection",
    description: "Exclusive collection of 10 virtual badges",
    price: 100,
    category: "rewards",
    icon: Gift
  },
  {
    id: 6,
    name: "Priority Support",
    description: "Get priority support for all your queries",
    price: 250,
    category: "premium",
    icon: Sparkles
  }
];

const categories = [
  { id: "all", name: "All Items", icon: ShoppingCart },
  { id: "premium", name: "Premium", icon: Crown },
  { id: "features", name: "Features", icon: Zap },
  { id: "rewards", name: "Rewards", icon: Gift }
];

const purchaseHistory = [
  { id: 1, item: "Unlimited Doubts", price: 200, date: "2 days ago", status: "active" },
  { id: 2, item: "Certificate - Physics", price: 150, date: "1 week ago", status: "completed" },
  { id: 3, item: "Virtual Badge Collection", price: 100, date: "2 weeks ago", status: "completed" }
];

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [purchasedItems, setPurchasedItems] = useState([]);
  
  const athenaCoins = 1250;

  const filteredItems = selectedCategory === "all" 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory);

  const handlePurchase = (itemId, price) => {
    if (athenaCoins >= price) {
      setPurchasedItems([...purchasedItems, itemId]);
      // In a real app, you would update the coin balance
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "premium": return "text-yellow-500";
      case "features": return "text-primary";
      case "rewards": return "text-secondary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Store</h1>
          <p className="text-muted-foreground mt-2">Redeem your Athena coins for premium features and rewards.</p>
        </div>

        {/* Coin Balance */}
        <div className="glass-card rounded-xl p-6 mb-8 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Coins className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{athenaCoins.toLocaleString()}</h2>
                <p className="text-muted-foreground">Athena Coins Available</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Ways to earn more coins:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Complete tests (+20-50 coins)</p>
                <p>• Daily study streak (+10 coins)</p>
                <p>• Ask quality doubts (+5 coins)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 glass-card rounded-lg p-1 w-fit">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store Items */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const IconComponent = item.icon;
                const isPurchased = purchasedItems.includes(item.id);
                const canAfford = athenaCoins >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`glass-card rounded-xl p-6 interactive relative ${
                      item.popular ? "border-primary/50" : "border-card-border"
                    }`}
                  >
                    {item.popular && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Popular
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        item.category === "premium" ? "bg-yellow-500/20" :
                        item.category === "features" ? "bg-primary/20" : "bg-secondary/20"
                      }`}>
                        <IconComponent className={`h-6 w-6 ${getCategoryColor(item.category)}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span className="text-xl font-bold text-foreground">{item.price}</span>
                      </div>
                      
                      {isPurchased ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Purchased</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item.id, item.price)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            canAfford
                              ? "btn-neon"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {canAfford ? "Redeem" : "Insufficient Coins"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase History */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Recent Purchases
              </h3>
              <div className="space-y-3">
                {purchaseHistory.map((purchase) => (
                  <div key={purchase.id} className="glass-card rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{purchase.item}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        purchase.status === "active" 
                          ? "bg-green-500/20 text-green-500" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{purchase.date}</span>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span>{purchase.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earning Tips */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Earning Tips
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-foreground font-medium">Daily Study Streak</p>
                    <p className="text-muted-foreground">Study for at least 30 minutes daily</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-foreground font-medium">Complete Tests</p>
                    <p className="text-muted-foreground">Higher scores earn more coins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-foreground font-medium">Ask Quality Doubts</p>
                    <p className="text-muted-foreground">Well-formulated questions are rewarded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Offers */}
            <div className="glass-card rounded-xl p-6 border border-secondary/30">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-secondary" />
                Special Offers
              </h3>
              <div className="space-y-3">
                <div className="glass-card rounded-lg p-3 border border-secondary/20">
                  <h4 className="font-medium text-foreground text-sm mb-1">Weekend Bundle</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Premium features + Unlimited doubts
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground line-through">700</span>
                      <span className="text-sm font-bold text-secondary">600</span>
                      <Coins className="h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">Save 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
