
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Menu as PrismaMenu } from '@prisma/client';
import type { StructuredMenuItem, MenuItem as MenuItemType } from '@/types';


export async function GET() {
  try {
    const allMenuItems: PrismaMenu[] = await prisma.menu.findMany({
      where: { isAtivo: true },
      orderBy: [{ menuPrincipalId: 'asc' }, { createdAt: 'asc' }], // Order to help structure
    });

    const menuMap = new Map<string, StructuredMenuItem>();
    const structuredMenu: StructuredMenuItem[] = [];

    // First pass: create a map of all items and identify top-level items
    allMenuItems.forEach(item => {
      const menuItemData: StructuredMenuItem = {
        id: item.id,
        titulo: item.titulo,
        nomeIcone: item.nomeIcone,
        menuPrincipalId: item.menuPrincipalId,
        isAtivo: item.isAtivo,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        subMenus: [] // Initialize subMenus array
      };
      menuMap.set(item.id, menuItemData);

      if (!item.menuPrincipalId) {
        structuredMenu.push(menuItemData);
      }
    });

    // Second pass: associate sub-items with their parents
    allMenuItems.forEach(item => {
      if (item.menuPrincipalId) {
        const parentItem = menuMap.get(item.menuPrincipalId);
        if (parentItem) {
          // Find the item in the map to ensure we are pushing the already processed item (with its own potential submenus)
          const currentItemFromMap = menuMap.get(item.id);
          if (currentItemFromMap) {
             parentItem.subMenus.push(currentItemFromMap);
          }
        }
      }
    });
    
    // Sort structuredMenu for consistent top-level order if needed
    structuredMenu.sort((a, b) => a.titulo.localeCompare(b.titulo));
    // Sort subMenus for consistent order
    structuredMenu.forEach(item => {
        if (item.subMenus) {
            item.subMenus.sort((a, b) => a.titulo.localeCompare(b.titulo));
        }
    });


    return NextResponse.json(structuredMenu);
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    let errorMessage = 'Failed to fetch menu items.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
