'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  BookOpen,
  Target,
  Heart,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  Camera
} from 'lucide-react';
import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading, LoadingSpinner } from '@/components/ui/Loading';
import { Input, Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { MagicCard } from '@/components/ui/MagicCard';
import { SkillEvolutionCard } from '@/components/profile/SkillEvolutionCard';
import { ConsistencyTracker } from '@/components/profile/ConsistencyTracker';
import { SkillTimeline } from '@/components/profile/SkillTimeline';
import { SkillRecommendations } from '@/components/profile/SkillRecommendations';
import { generateSkillRecommendations } from '@/lib/skillProgress';

export default function StudentProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({
    bio: '',
    skills: [],
    careerGoals: [],
    hobbies: []
  });
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      const result = await response.json();
      if (response.ok) {
        setData(result.student);
        setEditForm({
          bio: result.student.bio || '',
          skills: result.student.skills || [],
          careerGoals: result.student.careerGoals || [],
          hobbies: result.student.hobbies || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/student/profile/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setData({ ...data, image: result.imageUrl });
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error uploading image' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.student);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (field: string, value: string) => {
    if (!value.trim()) return;
    setEditForm({
      ...editForm,
      [field]: [...editForm[field], value.trim()]
    });
  };

  const removeItem = (field: string, index: number) => {
    setEditForm({
      ...editForm,
      [field]: editForm[field].filter((_: any, i: number) => i !== index)
    });
  };

  const addSkill = (name: string, category: string) => {
    const newSkill = {
      name,
      category,
      level: 1,
      xp: 0,
      addedDate: new Date(),
      lastPracticed: new Date(),
      streak: 0,
      bestStreak: 0,
      milestones: [],
      activities: []
    };

    setEditForm({
      ...editForm,
      skills: [...editForm.skills, newSkill]
    });
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter((_: any, i: number) => i !== index)
    });
  };

  if (isLoading) return <Loading text="Loading profile..." />;
  if (!data) return <div className="p-8 text-center">Failed to load profile data</div>;

  const recommendations = generateSkillRecommendations(
    data.careerGoals || [],
    (data.skills || []).map((s: any) => s.name),
    data.department
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <ParticleBackground />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24">
        {/* Profile Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl p-6 sm:p-8 border border-border bg-card text-card-foreground shadow-md mb-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-xl overflow-hidden relative">
                {data.image ? (
                  <img
                    src={data.image}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  data.name.charAt(0)
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-2 bg-background border border-border rounded-xl shadow-lg hover:bg-muted transition-colors text-primary disabled:opacity-50"
                title="Change profile picture"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{data.name}</h1>
              <p className="text-muted-foreground mb-4">
                {data.department} • Year {data.year}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge variant="secondary" className="px-4 py-1 bg-muted text-muted-foreground border border-border">
                  {data.email}
                </Badge>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "secondary" : "default"}
              className="rounded-xl px-6"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Alerts */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-6 p-4 rounded-xl flex items-center gap-3 border",
              message.type === "success"
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            )}
          >
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        {/* Main Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Left */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <motion.div variants={itemVariants}>
              <MagicCard className="rounded-3xl bg-card text-card-foreground border border-border" glow>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <BookOpen className="w-5 h-5 text-primary" />
                    About Me
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {isEditing ? (
                    <textarea
                      className="w-full h-32 p-4 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary transition-all outline-none"
                      placeholder="Write a short bio about yourself..."
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed italic">
                      {data.bio || "No bio added yet. Tell us about yourself!"}
                    </p>
                  )}
                </CardContent>
              </MagicCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <MagicCard className="rounded-3xl bg-card text-card-foreground border border-border" glow>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Skill Evolution
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track your progress and level up your skills
                  </p>
                </CardHeader>

                <CardContent>
                  <SkillEvolutionCard skills={isEditing ? editForm.skills : (data.skills || [])} />

                  {isEditing && (
                    <div className="mt-6 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                      <h5 className="text-sm font-semibold mb-3">Add New Skill</h5>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Skill name"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          className="flex-1 bg-background text-foreground border border-border"
                        />

                        <Select
                          value={newSkillCategory}
                          onChange={(e) => setNewSkillCategory(e.target.value)}
                          className="sm:w-44 bg-background text-foreground border border-border"
                        >
                          <option value="technical">Technical Skills</option>
                          <option value="language">Language</option>
                          <option value="soft">Soft Skill</option>
                          <option value="project">Project</option>
                          <option value="other">Other</option>
                        </Select>

                        <Button
                          size="sm"
                          onClick={() => addSkill(newSkillName, newSkillCategory)}
                          disabled={!newSkillName.trim()}
                          className="rounded-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </MagicCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ConsistencyTracker skills={data.skills || []} />
            </motion.div>
          </div>

          {/* Right */}
          <div className="space-y-6 lg:space-y-8">
            <motion.div variants={itemVariants}>
              <SkillTimeline skills={data.skills || []} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <MagicCard className="rounded-3xl bg-card text-card-foreground border border-border overflow-hidden" glow>
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <Target className="w-5 h-5" />
                    Career Goals
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* keep your existing content */}
                </CardContent>
              </MagicCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SkillRecommendations
                recommendations={recommendations}
                onAddSkill={(name, category) => addSkill(name, category)}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <MagicCard className="rounded-3xl bg-card text-card-foreground border border-border" glow>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                    <Heart className="w-5 h-5 text-red-500" />
                    Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* keep your existing content */}
                </CardContent>
              </MagicCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Sticky Action Bar */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card text-card-foreground p-4 rounded-2xl shadow-xl border border-border z-50"
            >
              <p className="text-sm font-medium text-muted-foreground hidden sm:block">
                You have unsaved changes
              </p>

              <Button variant="secondary" onClick={() => setIsEditing(false)} className="rounded-xl">
                Discard
              </Button>

              <Button className="rounded-xl px-8" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

}
