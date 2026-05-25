"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "../../app/actions/user";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type UserData = {
  name: string | null;
  email: string | null;
  phone: string | null;
  school: string | null;
  district: string | null;
};

export function SettingsForm({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    school: user.school || "",
    district: user.district || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfile(formData);
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Failed to update profile.");
      }
    });
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email Address (Read Only)</Label>
            <Input id="email" value={user.email || ""} disabled className="bg-zinc-100 dark:bg-zinc-800" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g. Rahul Das"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel"
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="e.g. 9876543210"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school" className="text-zinc-700 dark:text-zinc-300">School / College Name</Label>
              <Input 
                id="school" 
                value={formData.school} 
                onChange={e => setFormData({ ...formData, school: e.target.value })} 
                placeholder="Your School"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-zinc-700 dark:text-zinc-300">District</Label>
              <Input 
                id="district" 
                value={formData.district} 
                onChange={e => setFormData({ ...formData, district: e.target.value })} 
                placeholder="e.g. Kamrup"
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 transition-colors">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
