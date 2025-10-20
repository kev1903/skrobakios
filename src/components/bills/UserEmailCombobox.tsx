import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface UserEmailComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const UserEmailCombobox = ({ value, onValueChange }: UserEmailComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyMembers();
  }, []);

  const fetchCompanyMembers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .not('email', 'is', null);

      if (error) throw error;
      setUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: "Could not load company members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getDisplayValue = () => {
    if (!value) return "Select or type email";
    
    const user = users.find((u) => u.email === value);
    if (user) {
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
      return name ? `${name} (${user.email})` : user.email;
    }
    
    return value;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search or type email..." 
            onValueChange={(search) => {
              if (isValidEmail(search)) {
                onValueChange(search);
              }
            }}
          />
          <CommandEmpty>
            {loading ? "Loading..." : "Type an email address or select a user"}
          </CommandEmpty>
          <CommandGroup>
            <CommandItem
              value=""
              onSelect={() => {
                onValueChange("");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              Not assigned
            </CommandItem>
            {users.map((user) => {
              const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
              return (
                <CommandItem
                  key={user.user_id}
                  value={user.email}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.email ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{displayName}</span>
                    {user.first_name && (
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
