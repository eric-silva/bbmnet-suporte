
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import DynamicIcon from '@/components/ui/DynamicIcon';
import type { StructuredMenuItem } from '@/types';
import { useSession } from '@/components/auth/AppProviders';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, WifiOff } from 'lucide-react';
import Link from 'next/link'; // Assuming menu items might link somewhere

interface MegaMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function MegaMenu({ isOpen, onOpenChange }: MegaMenuProps) {
  const [menuItems, setMenuItems] = useState<StructuredMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useSession();

  useEffect(() => {
    console.log('menu ' + isOpen + ' ' + menuItems.length + ' ' + isLoading + ' ' + error);
    if (isOpen && menuItems.length === 0 && isLoading && !error) { // Fetch only if open and not already fetched/loading/errored
      fetchMenuItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Re-fetch if it was closed and reopened and data was cleared or never fetched.

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/menu', {
        headers: getAuthHeaders(), // Add auth if your menu API is protected
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data: StructuredMenuItem[] = await response.json();
      setMenuItems(data);
    } catch (err: any) {
      console.error('Failed to fetch menu items for MegaMenu:', err);
      setError(err.message || 'Could not load menu options.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch on initial mount if isOpen is true (e.g. if it was persisted)
  useEffect(() => {
    if (isOpen) {
      fetchMenuItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 p-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-2/5" />
              </div>
              <Skeleton className="h-4 w-3/4 ml-8" />
              <Skeleton className="h-4 w-1/2 ml-8" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <WifiOff className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">Error Loading Menu</h3>
          <p className="text-muted-foreground mt-1">{error}</p>
          <button 
            onClick={fetchMenuItems} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (menuItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No Menu Items</h3>
          <p className="text-muted-foreground mt-1">There are no menu items configured.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 p-6">
        {menuItems.map((mainItem) => (
          <div key={mainItem.id} className="flex flex-col">
            <Link href={`${mainItem.path}`} passHref> {/* Example link, adjust as needed */}
              <a className="group inline-block mb-2 text-foreground hover:text-primary transition-colors">
                <h3 className="text-lg font-headline font-semibold flex items-center">
                  <DynamicIcon name={mainItem.nomeIcone} className="mr-3 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  {mainItem.titulo}
                </h3>
              </a>
            </Link>
            {mainItem.subMenus && mainItem.subMenus.length > 0 && (
              <ul className="space-y-1 pl-8 border-l border-border ml-[10px]">
                {mainItem.subMenus.map((subItem) => (
                  <li key={subItem.id}>
                     <Link href={`${subItem.path}`} passHref> {/* Example link */}
                        <a className="text-sm text-muted-foreground hover:text-primary hover:font-medium transition-colors py-1 block">
                           {/* Optional: Icon for sub-item if design includes it: 
                               <DynamicIcon name={subItem.nomeIcone} className="mr-2 h-4 w-4 inline-block" /> 
                           */}
                           {subItem.titulo}
                        </a>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] md:w-[75vw] lg:w-[60vw] min-h-[50vh] max-h-[80vh] flex flex-col rounded-lg shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-headline text-primary">Menu Principal</DialogTitle>
          <DialogDescription>Navegue pelas funcionalidades do sistema.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
