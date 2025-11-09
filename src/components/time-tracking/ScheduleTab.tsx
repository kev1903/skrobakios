import React from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ScheduleTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-luxury-gold" />
          <h2 className="text-2xl font-bold text-foreground">Schedule & Appointments</h2>
        </div>
        <Button className="bg-luxury-gold hover:bg-luxury-gold/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Schedule Coming Soon
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Manage your appointments, meetings, and scheduled events all in one place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
