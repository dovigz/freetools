"use client";

import { PinButton } from "@/components/pin-button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToolManagement } from "@/hooks/use-tool-management";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Sortable Tool Item Component
function SortableToolItem({
  tool,
  isPinned,
  isActive,
  onLinkClick,
  hoveredTool,
  setHoveredTool,
  togglePin,
  isDragDisabled = false,
}: {
  tool: any;
  isPinned: boolean;
  isActive: boolean;
  onLinkClick: () => void;
  hoveredTool: string | null;
  setHoveredTool: (id: string | null) => void;
  togglePin: (id: string) => void;
  isDragDisabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tool.id,
    disabled: isDragDisabled || tool.id === "home" || !isPinned,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isHovered = hoveredTool === tool.id;

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHoveredTool(tool.id)}
      onMouseLeave={() => setHoveredTool(null)}
      className="relative group"
      {...attributes}
    >
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={tool.id !== "home" ? tool.name : undefined}
        className={`justify-start text-gray-700 hover:bg-gray-50 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 ${
          isPinned ? "border-l-2 border-l-blue-500 bg-blue-50/30" : ""
        } ${isDragging ? "cursor-grabbing" : ""}`}
      >
        <Link
          href={tool.path}
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium w-full"
        >
          {/* Drag handle - only show for pinned tools */}
          {isPinned && tool.id !== "home" && (
            <div
              {...listeners}
              className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 mr-1"
              title="Drag to reorder"
            >
              ⋮⋮
            </div>
          )}
          <span className="text-base">{tool.emoji}</span>
          <span className="flex-1">{tool.name}</span>
        </Link>
      </SidebarMenuButton>

      {/* Pin button - only show for non-home tools  and when sidebar is expanded */}
      {tool.id !== "home" && (
        <PinButton
          toolId={tool.id}
          isPinned={isPinned}
          isVisible={isHovered || isPinned}
          onTogglePin={togglePin}
        />
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { orderedTools, isToolPinned, togglePin, reorderPinned, isLoading } =
    useToolManagement();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Only allow reordering of pinned tools
    const pinnedTools = orderedTools.filter(
      (tool) => isToolPinned(tool.id) && tool.id !== "home"
    );

    const oldIndex = pinnedTools.findIndex((tool) => tool.id === active.id);
    const newIndex = pinnedTools.findIndex((tool) => tool.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(pinnedTools, oldIndex, newIndex);
      reorderPinned(newOrder.map((tool) => tool.id));
    }
  };

  return (
    <Sidebar {...props} className="border-r border-gray-200" collapsible="icon">
      <SidebarContent className="bg-white">
        {/* Logo */}
        <div className="flex items-center justify-start h-16 border-b px-4">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 select-none group transition-all duration-200"
          >
            <div className="flex items-center">
              <span className="font-bold text-xl text-gray-900">Free</span>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tools
              </span>
              <span className="ml-1 origin-center">🛠️</span>
            </div>
          </Link>
        </div>

        {/* Floating collapse button */}
        <div className="absolute top-20 -right-3 z-30 hidden md:block">
          <SidebarTrigger className="rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-6 w-6 p-0" />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            {isLoading ? (
              <SidebarMenu>
                {/* Loading skeleton */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={`skeleton-${i}`}>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedTools.map((tool) => tool.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <SidebarMenu>
                    {orderedTools.map((tool) => {
                      const isPinned = isToolPinned(tool.id);

                      return (
                        <SortableToolItem
                          key={tool.id}
                          tool={tool}
                          isPinned={isPinned}
                          isActive={pathname === tool.path}
                          onLinkClick={handleLinkClick}
                          hoveredTool={hoveredTool}
                          setHoveredTool={setHoveredTool}
                          togglePin={togglePin}
                          isDragDisabled={isMobile}
                        />
                      );
                    })}
                  </SidebarMenu>
                </SortableContext>
              </DndContext>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
