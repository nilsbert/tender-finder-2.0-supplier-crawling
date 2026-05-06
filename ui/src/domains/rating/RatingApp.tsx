import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {PButton,
  PTextFieldWrapper,
  PSelectWrapper,
  PModal,
  PHeading,
  PText,
  PTag,
  PIcon,
  PDivider,
  PFlex} from '@porsche-design-system/components-react'
import { DndContext, type DragEndEvent, PointerSensor, KeyboardSensor, useSensor, useSensors, pointerWithin, closestCenter, rectIntersection } from '@dnd-kit/core'
import { api, type Keyword, type KeywordCreate } from './api'
import RatingDashboardView from './RatingDashboardView'
import { ProcessHeader } from '../../components/ProcessHeader'
import { useURLState } from '../../hooks/useURLState'
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation'
import { StandardPageHeader } from '../../components/StandardPageHeader'
import { DraggableKeyword } from './DraggableKeyword'
import { DroppableGroup } from './DroppableGroup'
import { TrashDropZone } from './TrashDropZone'
import { ImportDiffModal, type KeywordImportSummary } from './ImportDiffModal'


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'keywords' | 'dashboard'>(() => {
    if (location.pathname.endsWith('/dashboard')) return 'dashboard';
    return window.location.hash.slice(1) === 'rating/dashboard' ? 'dashboard' : 'keywords';
  })
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Settings State

  const [dbMode, setDbMode] = useState<'disconnected' | 'cosmos'>('disconnected')

  // Form State
  const [formData, setFormData] = useState<KeywordCreate>({ term: '', weight: 1, type: 'Service', sub_type: '', category: '' })
  const [existingSubTypes, setExistingSubTypes] = useState<string[]>([])

  // Import/Export State
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importSummary, setImportSummary] = useState<KeywordImportSummary | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useURLState('search', '')
  const [typeFilter, setTypeFilter] = useURLState('type', '')
  const [subTypeFilter, setSubTypeFilter] = useURLState('subtype', '')

  const [weightMinStr, setWeightMinStr] = useURLState('w_min', '-5')
  const weightMin = parseFloat(weightMinStr) || -5

  const [weightMaxStr, setWeightMaxStr] = useURLState('w_max', '5')
  const weightMax = parseFloat(weightMaxStr) || 5

  const [sortBy] = useURLState('sort', 'term')
  const [sortOrder] = useURLState('order', 'asc')

  // Tree View State
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Service', 'Sector']))

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }



  const handleLocationChange = () => {
    if (location.pathname.endsWith('/dashboard')) {
      setCurrentView('dashboard');
    } else {
      const hash = window.location.hash.slice(1);
      setCurrentView(hash === 'rating/dashboard' ? 'dashboard' : 'keywords');
    }
  }


  const checkDbStatus = async () => {
    try {
      const status = await api.getConfigStatus()
      setDbMode(status.mode as 'disconnected' | 'cosmos')
    } catch (e) {
      console.error("Failed to check db status", e)
    }
  }

  const fetchKeywords = async () => {
    try {
      const data = await api.getKeywords()
      setKeywords(data)
    } catch (error) {
      console.error('Failed to fetch keywords', error)
    }
  }

  const fetchSubTypes = async () => {
    try {
      const cats = await api.getCategories()
      setExistingSubTypes(cats)
    } catch (e) {
      console.error("Failed to fetch sub-types", e)
    }
  }

  useEffect(() => {
    fetchKeywords()
    checkDbStatus()
    fetchSubTypes()
    handleLocationChange()
    // Sync on navigation changes
    return () => { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    handleLocationChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash])

  const openAddModal = () => {
    setFormData({
      term: '',
      weight: 1,
      type: 'Service',
      sub_type: '',
      sub_category: '',
      category: ''
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const handleEdit = (k: Keyword) => {
    setFormData({
      term: k.term,
      // For editing, use actual weight (signed)
      weight: k.weight,
      type: k.type || 'New',
      sub_type: k.sub_type || '',
      sub_category: k.sub_category || '',
      category: k.category || ''
    })
    setEditingId(k.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteKeyword(id);
      await fetchKeywords();
    } catch (error) {
      console.error('Failed to delete keyword', error);
      alert('Failed to delete keyword. Please try again.');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Frontend Validation
    const cleanTerm = formData.term.trim()
    if (!cleanTerm || cleanTerm.length < 2) {
      alert("Keyword term must be at least 2 characters long and cannot be blank.")
      return
    }
    if (cleanTerm.includes(' ')) {
      alert("Keywords cannot contain spaces. Use hyphens instead.")
      return
    }

    // Check for duplicates
    const duplicate = keywords.find(k =>
      k.term.toLowerCase() === cleanTerm.toLowerCase() && k.id !== editingId
    )
    if (duplicate) {
      alert(`Keyword "${cleanTerm}" already exists.`)
      return
    }

    // Validate rating (-5 to 5 range, non-zero)
    if (formData.weight === 0 || formData.weight < -5 || formData.weight > 5) {
      alert("Rating must be between -5 and 5 (excluding 0).")
      return
    }

    // Determine type based on weight polarity
    let finalType = formData.type
    if (formData.weight < 0) {
      finalType = 'Exclusion'
    } else if (formData.type === 'Exclusion' && formData.weight > 0) {
      // If it was Exclusion but is now positive, default to Service
      finalType = 'Service'
    }

    const payload = { ...formData, weight: formData.weight, type: finalType }

    try {
      if (editingId) {
        await api.updateKeyword(editingId, payload)
      } else {
        // New keywords always go to "New" category
        await api.createKeyword({
          ...payload,
          type: payload.type || 'Service',
          sub_type: payload.sub_type || '',
          sub_category: payload.sub_category || ''
        })
      }
      setIsModalOpen(false)
      fetchKeywords()
      fetchSubTypes()
    } catch (error: any) {
      console.error('Submit failed', error)
      const msg = error.response?.data?.detail || error.message || 'Failed to save keyword'
      alert(`Error: ${msg}`)
    }
  }

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10 // Require 10px drag before activating
      }
    }),
    useSensor(KeyboardSensor)
  )

  // Custom collision detection to prioritize trash zone
  const customCollisionDetection = (args: any) => {
    // 1. Check for trash zone first
    const trashZone = args.droppableContainers.find((c: any) => c.id === 'trash-zone');
    if (trashZone && args.active) {
      const collisions = rectIntersection({
        ...args,
        droppableContainers: [trashZone]
      });
      if (collisions.length > 0) {
        return collisions;
      }
    }
    // 2. Fallback to standard rectIntersection for other groups
    return rectIntersection(args);
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    console.log('DRAG_END:', { activeId: active.id, overId: over?.id });

    if (!over) return

    const keywordId = active.id as string
    const dropData = over.data.current as { type: string; sub_type: string; sub_category: string }
    const dragData = active.data.current as { keyword: Keyword; currentType: string; currentSubType: string; currentSubCategory: string }

    // Check if dropped on trash zone
    if (over.id === 'trash-zone' || (over.data.current as any)?.type === 'trash') {
      await handleDelete(keywordId)
      return
    }

    // Check if dropped on same location (no-op)
    if (
      dragData.currentType === dropData.type &&
      dragData.currentSubType === dropData.sub_type &&
      dragData.currentSubCategory === dropData.sub_category
    ) {
      return
    }

    const keyword = dragData.keyword
    let newWeight = keyword.weight

    // Auto-correct weight based on type
    if (dropData.type === 'Exclusion' && newWeight > 0) {
      newWeight = -newWeight
    } else if (['Service', 'Sector'].includes(dropData.type) && newWeight < 0) {
      newWeight = -newWeight
    }

    try {
      await api.updateKeyword(keywordId, {
        term: keyword.term,
        weight: newWeight,
        type: dropData.type,
        sub_type: dropData.sub_type,
        sub_category: dropData.sub_category,
        category: keyword.category || ''
      })

      fetchKeywords()
      fetchSubTypes()
    } catch (error) {
      console.error('Failed to move keyword:', error)
      alert('Failed to move keyword. Please try again.')
    }
  }

  // Filter and sort logic
  /* Grouping Logic: Type -> Sub-type (Main) -> Sub-category (Nested) -> Keywords */
  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = [...keywords]

    // 1. Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(k => k.term.toLowerCase().includes(q))
    }
    if (typeFilter) {
      filtered = filtered.filter(k => k.type === typeFilter)
    }
    if (subTypeFilter) {
      filtered = filtered.filter(k => k.sub_type === subTypeFilter)
    }
    if (weightMin !== -5 || weightMax !== 5) {
      filtered = filtered.filter(k => k.weight >= weightMin && k.weight <= weightMax)
    }

    // 2. Sort Keywords (Leaf Level)
    filtered.sort((a, b) => {
      if (sortBy === 'term') {
        return sortOrder === 'asc' ? a.term.localeCompare(b.term) : b.term.localeCompare(a.term)
      } else {
        return sortOrder === 'asc' ? a.weight - b.weight : b.weight - a.weight
      }
    })

    // 3. Group by Type > Sub-type > Sub-category
    const grouped: {
      type: string,
      subtypes: {
        name: string,
        subcategories: {
          name: string,
          keywords: Keyword[]
        }[]
      }[]
    }[] = []

    const typeMap = new Map<string, typeof grouped[0]>()

    filtered.forEach(k => {
      const type = k.type || 'Service'
      const subType = k.sub_type || 'Unassigned'
      const subCategory = k.sub_category || 'General'

      if (!typeMap.has(type)) {
        typeMap.set(type, { type, subtypes: [] })
        grouped.push(typeMap.get(type)!)
      }
      const typeGroup = typeMap.get(type)!

      let subTypeGroup = typeGroup.subtypes.find(s => s.name === subType)
      if (!subTypeGroup) {
        subTypeGroup = { name: subType, subcategories: [] }
        typeGroup.subtypes.push(subTypeGroup)
      }

      let subCategoryGroup = subTypeGroup.subcategories.find(c => c.name === subCategory)
      if (!subCategoryGroup) {
        subCategoryGroup = { name: subCategory, keywords: [] }
        subTypeGroup.subcategories.push(subCategoryGroup)
      }

      subCategoryGroup.keywords.push(k)
    })

    // 4. Sort Groups
    // 4. Sort Groups
    // Sort Types (Alphabetical, but Exclusion last)
    grouped.sort((a, b) => {
      if (a.type === b.type) return 0;
      if (a.type === 'Exclusion') return 1;
      if (b.type === 'Exclusion') return -1;
      return a.type.localeCompare(b.type);
    })

    // Sort Sub-types (Unassigned last)
    grouped.forEach(g => {
      g.subtypes.sort((a, b) => {
        if (a.name === 'Unassigned') return 1
        if (b.name === 'Unassigned') return -1
        return a.name.localeCompare(b.name)
      })

      // Sort Sub-categories (General first, then alphabetical)
      g.subtypes.forEach(st => {
        st.subcategories.sort((a, b) => {
          if (a.name === 'General') return -1
          if (b.name === 'General') return 1
          return a.name.localeCompare(b.name)
        })
      })
    })

    return grouped
  }, [keywords, searchQuery, typeFilter, subTypeFilter, weightMin, weightMax, sortBy, sortOrder])

  // --- Import / Export Handlers ---

  const handleExport = () => {
    api.exportKeywords();
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // First, dry run to get the summary
      const result = await api.importKeywords(file, true, false);
      setImportSummary(result.summary);
      setImportModalOpen(true);
    } catch (error: any) {
      console.error("Import analysis failed", error);
      alert(`Import analysis failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsImporting(false);
    }
  }

  const handleImportConfirm = async (deleteMissing: boolean) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await api.importKeywords(file, false, deleteMissing);
      setImportModalOpen(false);
      setImportSummary(null);
      fetchKeywords();
      alert("Import completed successfully.");
    } catch (error: any) {
      console.error("Import execution failed", error);
      alert(`Import failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsImporting(false);
    }
  }



  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('')
    setSubTypeFilter('')
    setWeightMinStr('-5')
    setWeightMaxStr('5')
  }



  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <ProcessHeader
        activeItem="qualification"
        dbMode={dbMode}
      />

      {/* Sub Navigation */}
      <StandardSubNavigation>
        <StandardSubNavigationItem
          label="Keywords"
          active={currentView === 'keywords'}
          onClick={() => navigate(`/qualification/keywords${location.search}`)}
        />
        <StandardSubNavigationItem
          label="Analysis Console"
          active={currentView === 'dashboard'}
          onClick={() => navigate(`/qualification/dashboard${location.search}`)}
        />
      </StandardSubNavigation>

      {currentView === 'dashboard' ? (
        <RatingDashboardView dbMode={dbMode} />
      ) : (
        /* Tree View for Keywords */
        <div className="p-content-wrapper">
          <div style={{ padding: '32px 24px' }}>
            <StandardPageHeader
              title="Rating Keywords"
              subtitle="Manage keywords and their weights for scoring."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
                {/* Search and Filters */}
                <PFlex alignItems="flex-end" style={{ gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <PTextFieldWrapper label="Search keywords">
                      <input
                        type="text"
                        placeholder="Search terms, types..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', height: '40px' }}
                      />
                    </PTextFieldWrapper>
                  </div>

                  <div style={{ minWidth: '140px' }}>
                    <PSelectWrapper label="Type">
                      <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        style={{ height: '40px' }}
                      >
                        <option value="">All Types</option>
                        <option value="Service">Service</option>
                        <option value="Sector">Sector</option>
                        <option value="Exclusion">Exclusion (Negative)</option>
                      </select>
                    </PSelectWrapper>
                  </div>

                  <div style={{ minWidth: '180px' }}>
                    <PSelectWrapper label="Sub-type">
                      <select
                        value={subTypeFilter}
                        onChange={e => setSubTypeFilter(e.target.value)}
                        style={{ height: '40px' }}
                      >
                        <option value="">All Sub-types</option>
                        {existingSubTypes.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </PSelectWrapper>
                  </div>

                  {(searchQuery || typeFilter || subTypeFilter) && (
                    <PButton
                      variant="tertiary"
                      icon="close"
                      onClick={clearFilters}
                      style={{ marginBottom: '2px' }}
                    >
                      Clear
                    </PButton>
                  )}
                </PFlex>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <PButton
                    variant="primary"
                    icon="plus"
                    onClick={openAddModal}
                  >
                    Add Keyword
                  </PButton>

                  {/* Import / Export Actions */}
                  <PFlex>
                    <PButton variant="tertiary" icon="download" onClick={handleExport}>Export</PButton>
                    <PButton variant="tertiary" icon="upload" onClick={handleImportClick} loading={isImporting}>
                      Import
                    </PButton>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="application/json,.json,.JSON,application/x-yaml,.yaml,.yml"
                      onChange={handleFileSelect}
                    />
                  </PFlex>

                  <div style={{ textAlign: 'right', color: '#666' }}>
                    <PText size="small">
                      {filteredAndSortedKeywords.reduce((acc, group) => acc + group.subtypes.reduce((subAcc, sub) => subAcc + sub.subcategories.reduce((cAcc, cat) => cAcc + cat.keywords.length, 0), 0), 0)} keywords
                    </PText>
                  </div>
                </div>
              </div>
            </StandardPageHeader>

            <PDivider />

            {/* Tree View */}
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              collisionDetection={customCollisionDetection}
            >
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredAndSortedKeywords.map(typeGroup => (
                  <DroppableGroup
                    key={typeGroup.type}
                    id={`type-${typeGroup.type}`}
                    type={typeGroup.type}
                    isExpanded={expandedGroups.has(typeGroup.type)}
                    onAutoExpand={() => toggleGroup(typeGroup.type)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Level 1: Services / Sectors Header */}
                    <div
                      style={{
                        padding: '16px 24px',
                        backgroundColor: '#f5f5f5',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => toggleGroup(typeGroup.type)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PIcon name={expandedGroups.has(typeGroup.type) ? 'arrow-head-down' : 'arrow-head-right'} />
                        <PHeading size="small" tag="h3">
                          {typeGroup.type === 'Service' ? 'Services' : typeGroup.type === 'Sector' ? 'Sectors' : typeGroup.type}
                        </PHeading>
                        <PTag color="background-base">
                          {typeGroup.subtypes.reduce((acc, sub) => acc + sub.subcategories.reduce((sAcc, cat) => sAcc + cat.keywords.length, 0), 0)}
                        </PTag>
                      </div>
                    </div>

                    {expandedGroups.has(typeGroup.type) && (
                      <div style={{ padding: '0' }}>
                        {typeGroup.subtypes.map(subTypeGroup => (
                          <DroppableGroup
                            key={subTypeGroup.name}
                            id={`subtype-${typeGroup.type}-${subTypeGroup.name}`}
                            type={typeGroup.type}
                            subType={subTypeGroup.name}
                            isExpanded={expandedGroups.has(`${typeGroup.type}-${subTypeGroup.name}`)}
                            onAutoExpand={() => toggleGroup(`${typeGroup.type}-${subTypeGroup.name}`)}
                            style={{ borderTop: '1px solid #f0f0f0' }}
                          >
                            {/* Level 2: Main Category Header */}
                            <div
                              style={{
                                padding: '12px 24px 12px 48px',
                                backgroundColor: '#fafafa',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                              onClick={() => toggleGroup(`${typeGroup.type}-${subTypeGroup.name}`)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PIcon name={expandedGroups.has(`${typeGroup.type}-${subTypeGroup.name}`) ? 'arrow-head-down' : 'arrow-head-right'} />
                                <PText weight="semi-bold">{subTypeGroup.name || 'Unassigned'}</PText>
                                <PTag color="background-surface">
                                  {subTypeGroup.subcategories.reduce((acc, cat) => acc + cat.keywords.length, 0)}
                                </PTag>
                              </div>
                            </div>

                            {/* Level 3: Sub Category & Keywords */}
                            {expandedGroups.has(`${typeGroup.type}-${subTypeGroup.name}`) && (
                              <div style={{ padding: '0' }}>
                                {subTypeGroup.subcategories.map(detailedGroup => (
                                  <DroppableGroup
                                    key={detailedGroup.name}
                                    id={`subcategory-${typeGroup.type}-${subTypeGroup.name}-${detailedGroup.name}`}
                                    type={typeGroup.type}
                                    subType={subTypeGroup.name}
                                    subCategory={detailedGroup.name}
                                    isExpanded={expandedGroups.has(`${typeGroup.type}-${subTypeGroup.name}-${detailedGroup.name}`)}
                                    onAutoExpand={() => toggleGroup(`${typeGroup.type}-${subTypeGroup.name}-${detailedGroup.name}`)}
                                  >
                                    {/* Level 3 Header (only if not 'General' or multiple subcats exist) */}
                                    {(detailedGroup.name !== 'General' || subTypeGroup.subcategories.length > 1) && (
                                      <div
                                        style={{
                                          padding: '8px 24px 8px 72px',
                                          backgroundColor: '#fcfcfc',
                                          borderTop: '1px solid #f5f5f5',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          cursor: 'pointer'
                                        }}
                                        onClick={() => toggleGroup(`${typeGroup.type}-${subTypeGroup.name}-${detailedGroup.name}`)}
                                      >
                                        <PIcon name={expandedGroups.has(`${typeGroup.type}-${subTypeGroup.name}-${detailedGroup.name}`) ? 'arrow-head-down' : 'arrow-head-right'} size="small" />
                                        <PText size="small" weight="semi-bold" color="contrast-medium">{detailedGroup.name}</PText>
                                        <PText size="x-small" color="contrast-low">({detailedGroup.keywords.length})</PText>
                                      </div>
                                    )}

                                    {/* Keywords List */}
                                    {(detailedGroup.name === 'General' && subTypeGroup.subcategories.length === 1 || expandedGroups.has(`${typeGroup.type}-${subTypeGroup.name}-${detailedGroup.name}`)) && (
                                      <div>
                                        {detailedGroup.keywords.map(k => (
                                          <DraggableKeyword
                                            key={k.id}
                                            keyword={k}
                                            onEdit={handleEdit}
                                          />
                                        ))}
                                        {detailedGroup.keywords.length === 0 && (
                                          <div style={{ padding: '16px 96px' }}>
                                            <PText color="contrast-low" size="small">No keywords in this group.</PText>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </DroppableGroup>
                                ))}
                              </div>
                            )}
                          </DroppableGroup>
                        ))}
                      </div>
                    )}
                  </DroppableGroup>
                ))}

                {filteredAndSortedKeywords.length === 0 && (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <PText color="contrast-low">
                      {searchQuery || typeFilter || subTypeFilter || weightMin !== -5 || weightMax !== 5
                        ? 'No keywords found matching your filters.'
                        : 'No keywords found. Add one to get started.'}
                    </PText>
                  </div>
                )}

                {/* Trash Drop Zone */}
                <TrashDropZone />
              </div>
            </DndContext>
          </div>
        </div>
      )
      }

      {/* Keyword Modal */}
      <PModal
        open={isModalOpen}
        onDismiss={() => setIsModalOpen(false)}
        heading={editingId ? 'Edit Keyword' : 'New Keyword'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <PTextFieldWrapper label="Keyword">
              <input
                autoFocus
                required
                type="text"
                value={formData.term}
                onChange={e => setFormData({ ...formData, term: e.target.value })}
                placeholder="e.g. Jira, Azure, Scrum..."
              />
            </PTextFieldWrapper>

            {!editingId && (
              <PText size="small" color="contrast-low" style={{ marginTop: '-8px' }}>
                After adding, drag the keyword to the appropriate category to organize it.
              </PText>
            )}

            <div>
              <PText weight="semi-bold" style={{ marginBottom: '12px' }}>
                Scoring: {formData.weight.toFixed(1)}
              </PText>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                onClick={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
                style={{ width: '100%' }}
              />
              <PFlex justifyContent="space-between" style={{ marginTop: '4px' }}>
                <PText size="x-small" color="contrast-low">-5.0</PText>
                <PText size="x-small" color="contrast-low">0</PText>
                <PText size="x-small" color="contrast-low">5.0</PText>
              </PFlex>
            </div>

            <PFlex justifyContent="flex-end" style={{ gap: '8px', marginTop: '8px' }}>
              <PButton
                type="button"
                variant="tertiary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </PButton>
              <PButton type="submit">
                {editingId ? 'Save Changes' : 'Add Keyword'}
              </PButton>
            </PFlex>
          </div>
        </form>
      </PModal >

      <ImportDiffModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        summary={importSummary}
        onConfirm={handleImportConfirm}
        isExecuting={isImporting}
      />
    </div >
  )
}

export default App
