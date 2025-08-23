
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-main">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Create a password" />
          </div>
          <Button className="w-full bg-gradient-primary hover:opacity-90 text-white">
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
