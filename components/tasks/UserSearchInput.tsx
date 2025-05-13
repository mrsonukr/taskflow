"use client";

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, User } from '@/context/UserContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from '@/components/ui/card';

interface UserSearchInputProps {
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
}

export function UserSearchInput({ selectedUsers, setSelectedUsers }: UserSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const { searchUsers, currentUser } = useUser();

  // Log selectedUsers for debugging
  useEffect(() => {
    console.log('Selected Users:', selectedUsers);
  }, [selectedUsers]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === '') {
        setResults([]);
        return;
      }
      try {
        const users = await searchUsers(searchQuery);
        const filtered = users.filter(
          user => !selectedUsers.some(sel => sel.id === user.id) &&
                  user.id !== currentUser?.id
        );
        setResults(filtered);
      } catch (error) {
        console.error('User search failed', error);
        setResults([]);
      }
    };

    const debounce = setTimeout(fetchUsers, 300); // Add debounce for better UX
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedUsers, currentUser, searchUsers]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery('');
    setResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="space-y-4 h-[300px]">
      {/* Selected Users */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users selected</p>
        ) : (
          selectedUsers.map(user => (
            <Badge
              key={user.id}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-2"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {user.fullName.charAt(0)}
              </div>
              <span>{user.fullName}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRemoveUser(user.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {user.fullName}</span>
              </Button>
            </Badge>
          ))
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Search Results */}
        {searchQuery && (
          <Card className="absolute z-50 mt-2 w-full overflow-hidden">
            <ScrollArea className="h-72">
              {results.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No users found
                </div>
              ) : (
                <div className="p-2">
                  {results.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent text-left transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}