import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Sparkles, 
  FolderTree,
  Download,
  Clock,
  Target,
  Search,
  Users,
  History,
  Palette
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Smart Note-Taking",
      description: "Create notes in multiple formats tailored to your subject - from Cornell notes to mind maps."
    },
    {
      icon: Brain,
      title: "AI-Powered Quizzes",
      description: "Automatically generate quizzes from your notes to test your knowledge and track progress."
    },
    {
      icon: Sparkles,
      title: "AI Beautification",
      description: "Transform your notes with AI-enhanced formatting, images, and professional styling."
    },
    {
      icon: Target,
      title: "Importance Analysis",
      description: "AI highlights the most important concepts in your notes to focus your study time."
    },
    {
      icon: FolderTree,
      title: "Unlimited Organization",
      description: "Organize your notes with unlimited folders and tags for easy retrieval."
    },
    {
      icon: Download,
      title: "Multi-Format Export",
      description: "Export your notes to PDF, DOCX, Markdown, or HTML for maximum flexibility."
    },
    {
      icon: Clock,
      title: "Auto-Save",
      description: "Never lose your work with automatic saving every few seconds."
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find any note instantly with powerful search across all your content."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Share and collaborate on notes with classmates or colleagues."
    },
    {
      icon: History,
      title: "Version History",
      description: "Access previous versions of your notes and restore when needed."
    },
    {
      icon: Palette,
      title: "Custom Themes",
      description: "Personalize your workspace with custom color themes and layouts."
    },
    {
      icon: FileText,
      title: "Note Templates",
      description: "Start quickly with pre-built templates for different subjects and use cases."
    }
  ];

  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out",
      features: ["10 notes", "1 folder", "5 quizzes/month", "Basic export"]
    },
    {
      name: "Gold",
      price: "$9.99",
      period: "/month",
      description: "For serious students",
      features: ["100 notes", "Unlimited folders", "50 quizzes/month", "AI features", "Auto-save", "Advanced export"],
      popular: true
    },
    {
      name: "Platinum",
      price: "$19.99",
      period: "/month",
      description: "Unlimited everything",
      features: ["Unlimited notes", "Unlimited folders", "Unlimited quizzes", "All AI features", "Collaboration", "Priority support"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Take Notes.
              <span className="block text-primary">Study Smarter.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
              The AI-powered note-taking app that helps you learn faster with smart organization, 
              automated quizzes, and intelligent study tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to enhance your learning experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-accent/20 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <Card 
                key={tier.name}
                className={`relative ${tier.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="text-center py-16 px-8">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who are studying smarter with AI-powered note-taking
            </p>
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Learning for Free
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Landing;
