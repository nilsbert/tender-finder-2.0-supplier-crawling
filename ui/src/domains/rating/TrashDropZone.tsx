import { useDroppable } from '@dnd-kit/core'
import {PIcon, PText} from '@porsche-design-system/components-react'

export function TrashDropZone() {
    const { setNodeRef, isOver, active } = useDroppable({
        id: 'trash-zone',
        data: {
            type: 'trash'
        }
    })

    const dropZoneStyle = {
        padding: '24px',
        margin: '24px 16px',
        border: isOver && active ? '3px dashed var(--tf-accent)' : '2px dashed #e0e0e0',
        borderRadius: '8px',
        backgroundColor: isOver && active ? 'var(--tf-accent-bg)' : '#fafafa',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '8px',
        transition: 'all 200ms ease',
        cursor: isOver && active ? 'pointer' : 'default'
    }

    return (
        <div ref={setNodeRef} style={dropZoneStyle}>
            <PIcon
                name="delete"
                size="medium"
                color={isOver && active ? 'notification-error' : 'contrast-low'}
            />
            <PText
                size="small"
                weight="semi-bold"
                color={isOver && active ? 'notification-error' : 'contrast-low'}
            >
                {isOver && active ? 'Release to Delete' : 'Drag here to delete'}
            </PText>
        </div>
    )
}
