import { useDroppable } from '@dnd-kit/core'
import { type ReactNode, useEffect, useRef } from 'react'

interface DroppableGroupProps {
    id: string
    type: string
    subType?: string
    subCategory?: string
    children: ReactNode
    isExpanded: boolean
    onAutoExpand?: () => void
    className?: string
    style?: React.CSSProperties
}

export function DroppableGroup({
    id,
    type,
    subType,
    subCategory,
    children,
    isExpanded,
    onAutoExpand,
    className = '',
    style = {}
}: DroppableGroupProps) {
    const { setNodeRef, isOver, active } = useDroppable({
        id,
        data: {
            type,
            sub_type: subType || '',
            sub_category: subCategory || ''
        }
    })

    const expandTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        // Auto-expand logic: if dragging over a collapsed group, expand after 800ms
        if (isOver && active && !isExpanded && onAutoExpand) {
            expandTimeoutRef.current = setTimeout(() => {
                onAutoExpand()
            }, 800)
        }

        // Clear timeout when leaving or when expanded
        return () => {
            if (expandTimeoutRef.current) {
                clearTimeout(expandTimeoutRef.current)
                expandTimeoutRef.current = null
            }
        }
    }, [isOver, active, isExpanded, onAutoExpand])

    const dropZoneStyle: React.CSSProperties = {
        ...style,
        border: isOver && active ? '2px solid #00b0f0' : style.border || 'none',
        backgroundColor: isOver && active ? 'rgba(0, 176, 240, 0.05)' : style.backgroundColor,
        transition: 'all 200ms ease'
    }

    return (
        <div
            ref={setNodeRef}
            className={`droppable-group ${className}`}
            style={dropZoneStyle}
        >
            {children}
        </div>
    )
}
