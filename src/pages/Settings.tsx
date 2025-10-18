import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState(localStorage.getItem("app-theme") || "default");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("app-dark-mode") === "true"
  );

  useEffect(() => {
    // Apply saved theme on load
    const savedTheme = localStorage.getItem("app-theme") || "default";
    const isDark = localStorage.getItem("app-dark-mode") === "true";
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
    
    const selectedTheme = themes.find(t => t.id === savedTheme);
    if (selectedTheme) {
      const root = document.documentElement;
      root.style.setProperty("--primary", selectedTheme.primary);
      root.style.setProperty("--accent", selectedTheme.accent);
    }
  }, []);

  const themes = [
    { id: "default", name: "Default", primary: "240 6% 10%", accent: "240 5% 96%" },
    { id: "blue", name: "Ocean Blue", primary: "210 100% 50%", accent: "210 100% 95%" },
    { id: "purple", name: "Royal Purple", primary: "270 70% 50%", accent: "270 70% 95%" },
    { id: "green", name: "Forest Green", primary: "140 70% 40%", accent: "140 70% 95%" },
    { id: "orange", name: "Sunset Orange", primary: "25 95% 53%", accent: "25 95% 95%" },
    { id: "pink", name: "Rose Pink", primary: "330 80% 60%", accent: "330 80% 95%" },
  ];

  const applyTheme = (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (!selectedTheme) return;

    const root = document.documentElement;
    root.style.setProperty("--primary", selectedTheme.primary);
    root.style.setProperty("--accent", selectedTheme.accent);
    
    localStorage.setItem("app-theme", themeId);
    setTheme(themeId);
    
    toast({
      title: "Theme Applied",
      description: `${selectedTheme.name} theme has been applied successfully.`,
    });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app-dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app-dark-mode", "false");
    }
    
    toast({
      title: darkMode ? "Light Mode Enabled" : "Dark Mode Enabled",
      description: "Your preference has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl space-y-8">
        {/* Dark Mode Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance Mode
            </CardTitle>
            <CardDescription>
              Choose between light and dark mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Switch to Dark Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Theme
            </CardTitle>
            <CardDescription>
              Choose a color scheme for your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={applyTheme}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themes.map((themeOption) => (
                  <div key={themeOption.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={themeOption.id} id={themeOption.id} />
                    <Label
                      htmlFor={themeOption.id}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div
                        className="w-8 h-8 rounded-md border-2"
                        style={{ 
                          backgroundColor: `hsl(${themeOption.primary})`,
                          borderColor: `hsl(${themeOption.accent})`
                        }}
                      />
                      <span>{themeOption.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="w-full sm:w-auto"
            >
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
