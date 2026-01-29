import { useState, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { trpc } from '../trpc';
import { PatternGroupEditor } from '../components/PatternGroupEditor';
import { ExampleEditor } from '../components/ExampleEditor';
import type { Theme } from '../theme';
import { generateDisplayPattern, generateDisplaySegments, GroupType, generateValidExample, validateHandExamples } from 'common';
import type { PatternGroup, DisplaySegment, HandExample, CardHand, HandValidationResult } from 'common';

const useStyles = createUseStyles((theme: Theme) => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderBottom: `1px solid rgba(139, 125, 107, 0.4)`,
    backgroundColor: 'rgba(200, 185, 165, 0.85)',
    backdropFilter: 'blur(8px)',
    flexShrink: 0,
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2D2A26',
    margin: 0,
    textShadow: '0 1px 0 rgba(255,255,255,0.3)',
  },
  backLink: {
    color: '#8B3A3A',
    textDecoration: 'none',
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  panels: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid rgba(139, 125, 107, 0.4)`,
    backgroundColor: 'rgba(225, 215, 200, 0.82)',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
  },
  panelNarrow: {
    width: '140px',
    flexShrink: 0,
  },
  panelMedium: {
    width: '180px',
    flexShrink: 0,
  },
  panelWide: {
    width: '280px',
    flexShrink: 0,
  },
  panelFlex: {
    flex: 1,
    borderRight: 'none',
  },
  panelHeader: {
    padding: theme.spacing.sm,
    borderBottom: `1px solid rgba(139, 125, 107, 0.3)`,
    backgroundColor: 'rgba(200, 185, 165, 0.6)',
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    color: '#3D3832',
    textTransform: 'uppercase',
    margin: 0,
    textShadow: '0 1px 0 rgba(255,255,255,0.3)',
  },
  panelContent: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: 'rgba(240, 235, 225, 0.5)',
  },
  panelFooter: {
    padding: theme.spacing.sm,
    borderTop: `1px solid rgba(139, 125, 107, 0.3)`,
    backgroundColor: 'rgba(200, 185, 165, 0.6)',
    flexShrink: 0,
  },
  listItem: {
    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
    cursor: 'pointer',
    borderBottom: `1px solid rgba(139, 125, 107, 0.2)`,
    fontSize: theme.fontSizes.sm,
    color: '#2D2A26',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 250, 240, 0.4)',
    '&:hover': {
      backgroundColor: 'rgba(255, 250, 240, 0.7)',
    },
  },
  listItemSelected: {
    backgroundColor: 'rgba(184, 74, 74, 0.85)',
    color: 'white',
    textShadow: '0 1px 1px rgba(0,0,0,0.2)',
    '&:hover': {
      backgroundColor: 'rgba(184, 74, 74, 0.9)',
    },
  },
  listItemActive: {
    fontSize: '10px',
    opacity: 0.8,
  },
  categoryItem: {
    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
    cursor: 'grab',
    borderBottom: `1px solid rgba(139, 125, 107, 0.2)`,
    fontSize: theme.fontSizes.sm,
    color: '#2D2A26',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 250, 240, 0.4)',
    transition: 'background-color 0.15s, opacity 0.15s',
    '&:hover': {
      backgroundColor: 'rgba(255, 250, 240, 0.7)',
    },
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(184, 74, 74, 0.85)',
    color: 'white',
    textShadow: '0 1px 1px rgba(0,0,0,0.2)',
    '&:hover': {
      backgroundColor: 'rgba(184, 74, 74, 0.9)',
    },
  },
  categoryItemDragging: {
    opacity: 0.5,
    cursor: 'grabbing',
  },
  categoryItemDragOver: {
    borderTop: `2px solid ${theme.colors.primary}`,
    marginTop: '-2px',
  },
  handItem: {
    padding: theme.spacing.sm,
    cursor: 'grab',
    borderBottom: `1px solid rgba(139, 125, 107, 0.2)`,
    transition: 'background-color 0.15s, transform 0.15s, opacity 0.15s',
    backgroundColor: 'rgba(255, 250, 240, 0.4)',
    '&:hover': {
      backgroundColor: 'rgba(255, 250, 240, 0.75)',
    },
  },
  handItemSelected: {
    backgroundColor: 'rgba(184, 74, 74, 0.15)',
    borderLeft: `3px solid ${theme.colors.primary}`,
  },
  handItemDragging: {
    opacity: 0.5,
    cursor: 'grabbing',
  },
  handItemDragOver: {
    borderTop: `2px solid ${theme.colors.primary}`,
    marginTop: '-2px',
  },
  handName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    color: '#2D2A26',
    margin: 0,
    marginBottom: '2px',
  },
  handPattern: {
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#3D3832',
  },
  handMeta: {
    display: 'flex',
    gap: theme.spacing.xs,
    marginTop: '4px',
    fontSize: '10px',
  },
  badge: {
    padding: '1px 4px',
    borderRadius: '3px',
    fontWeight: 'bold',
  },
  badgePoints: {
    backgroundColor: 'rgba(184, 74, 74, 0.25)',
    color: '#8B3A3A',
  },
  badgeConcealed: {
    backgroundColor: 'rgba(142, 36, 170, 0.25)',
    color: '#7B1FA2',
  },
  warningIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: '#FFA726',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  validationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    backgroundColor: '#FF5722',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '0 4px',
    marginLeft: '4px',
  },
  validationBadgeSmall: {
    minWidth: '14px',
    height: '14px',
    borderRadius: '7px',
    fontSize: '9px',
    padding: '0 3px',
  },
  notesIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: theme.colors.textMuted,
    color: 'white',
    fontSize: '9px',
    fontWeight: 'bold',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  // Segment colors - darker for better visibility on warm background
  segmentDot: { color: '#1565C0' },
  segmentBam: { color: '#2E7D32' },
  segmentCrak: { color: '#C62828' },
  segmentWind: { color: '#6A1B9A' },
  segmentDragon: { color: '#E65100' },
  segmentFlower: { color: '#AD1457' },
  segmentJoker: { color: '#00838F' },
  segmentNeutral: { color: '#4A4540' },
  segmentVariable: {
    borderBottom: '2px dotted currentColor',
    paddingBottom: '1px',
  },
  addButton: {
    width: '100%',
    padding: theme.spacing.sm,
    border: 'none',
    backgroundColor: 'rgba(255, 250, 240, 0.5)',
    color: '#8B3A3A',
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'rgba(184, 74, 74, 0.15)',
    },
  },
  // Detail panel styles
  detailPanel: {
    padding: theme.spacing.md,
    overflow: 'auto',
  },
  detailEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6B5F52',
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  formLabel: {
    display: 'block',
    fontSize: theme.fontSizes.sm,
    color: '#4A4540',
    marginBottom: theme.spacing.xs,
    fontWeight: 'bold',
  },
  formInput: {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid rgba(139, 125, 107, 0.4)`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2D2A26',
    fontSize: theme.fontSizes.sm,
    boxSizing: 'border-box',
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
  },
  formRow: {
    display: 'flex',
    gap: theme.spacing.md,
  },
  formRowItem: {
    flex: 1,
  },
  formHeader: {
    display: 'flex',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  formHeaderLeft: {
    width: '50%',
    flexShrink: 0,
  },
  formHeaderRight: {
    width: '50%',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  formHeaderRightRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: '100%',
  },
  pointsInput: {
    width: '70px',
    padding: theme.spacing.sm,
    border: `1px solid rgba(139, 125, 107, 0.4)`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2D2A26',
    fontSize: theme.fontSizes.sm,
    boxSizing: 'border-box',
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  formCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    fontSize: theme.fontSizes.sm,
    color: '#2D2A26',
  },
  displayPatternPreview: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.borderRadius.sm,
    fontFamily: 'monospace',
    fontSize: theme.fontSizes.md,
    border: `1px solid rgba(139, 125, 107, 0.2)`,
  },
  formActions: {
    display: 'flex',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderTop: `1px solid rgba(139, 125, 107, 0.3)`,
    backgroundColor: 'rgba(200, 185, 165, 0.6)',
    flexShrink: 0,
  },
  editPanelContent: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  editPanelForm: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing.md,
  },
  saveButton: {
    padding: '4px 10px',
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  cancelButton: {
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: '#4A4540',
    border: `1px solid rgba(139, 125, 107, 0.4)`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: '12px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: '#4A4540',
    },
  },
  cloneButton: {
    padding: '4px 10px',
    backgroundColor: 'rgba(107, 142, 122, 0.2)',
    color: '#4A6B5A',
    border: `1px solid rgba(107, 142, 122, 0.5)`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'rgba(107, 142, 122, 0.3)',
      borderColor: '#4A6B5A',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  deleteButton: {
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    color: '#B84A4A',
    border: `1px solid #B84A4A`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: 'auto',
    '&:hover': {
      backgroundColor: 'rgba(184, 74, 74, 0.15)',
    },
  },
  loading: {
    padding: theme.spacing.md,
    color: '#6B5F52',
    fontStyle: 'italic',
    fontSize: theme.fontSizes.sm,
  },
  empty: {
    padding: theme.spacing.md,
    color: '#6B5F52',
    fontStyle: 'italic',
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  },
}));

interface EditFormData {
  displayName: string;
  displayPattern: string;
  displaySegments: DisplaySegment[];
  patternGroups: PatternGroup[];
  isConcealed: boolean;
  points: number;
  notes: string;
  displayOrder: number;
  examples: HandExample[];
}

export function AdminPage() {
  const classes = useStyles();

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedHandId, setSelectedHandId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draggedHandId, setDraggedHandId] = useState<number | null>(null);
  const [dragOverHandId, setDragOverHandId] = useState<number | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<number | null>(null);

  // Fetch cards (formerly years)
  const { data: cards, isLoading: cardsLoading } = trpc.cardYear.list.useQuery();

  // Fetch categories for selected card
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = trpc.cardHand.listCategories.useQuery(
    { cardYearId: selectedCardId! },
    { enabled: selectedCardId !== null }
  );

  // Fetch hands for selected category
  const { data: hands, isLoading: handsLoading, refetch: refetchHands } = trpc.cardHand.listByCategory.useQuery(
    { categoryId: selectedCategoryId! },
    { enabled: selectedCategoryId !== null }
  );

  // Fetch ALL hands for the selected card (for validation badges on all categories)
  const { data: allHandsForCard, refetch: refetchAllHands } = trpc.cardHand.listByCardYear.useQuery(
    { cardYearId: selectedCardId! },
    { enabled: selectedCardId !== null }
  );

  // Mutations
  const updateHand = trpc.cardHand.update.useMutation({
    onSuccess: () => {
      refetchHands();
      refetchAllHands();
    },
  });

  const deleteHand = trpc.cardHand.delete.useMutation({
    onSuccess: () => {
      refetchHands();
      refetchAllHands();
      setSelectedHandId(null);
      setEditFormData(null);
    },
  });

  const createHand = trpc.cardHand.create.useMutation({
    onSuccess: (newHand) => {
      refetchHands();
      refetchAllHands();
      setIsCreatingNew(false);
      setSelectedHandId(newHand.id);
      loadHandIntoForm(newHand);
    },
  });

  const reorderHands = trpc.cardHand.reorder.useMutation({
    onSuccess: () => {
      refetchHands();
    },
  });

  const reorderCategoriesMutation = trpc.cardHand.reorderCategories.useMutation({
    onSuccess: () => {
      refetchCategories();
    },
  });

  // Auto-select first card
  if (cards && cards.length > 0 && selectedCardId === null) {
    setSelectedCardId(cards[0].id);
  }

  // Auto-select first category when card changes
  if (categories && categories.length > 0 && selectedCategoryId === null) {
    setSelectedCategoryId(categories[0].id);
  }

  // Compute validation results for all hands in the current category
  const handValidationResults = useMemo(() => {
    if (!hands) return new Map<number, HandValidationResult>();
    const results = new Map<number, HandValidationResult>();
    for (const hand of hands) {
      // Create a CardHand-like object for validation
      const cardHand: CardHand = {
        id: hand.id,
        categoryId: hand.categoryId,
        displayName: hand.displayName,
        displayPattern: hand.displayPattern,
        patternGroups: hand.patternGroups,
        isConcealed: hand.isConcealed,
        points: hand.points,
        notes: hand.notes,
        displayOrder: hand.displayOrder,
        examples: hand.examples || [],
        createdAt: new Date(), // Required by CardHand type but not used in validation
      };
      results.set(hand.id, validateHandExamples(cardHand));
    }
    return results;
  }, [hands]);

  // Compute validation issue counts for ALL categories in the selected card
  const categoryIssueCounts = useMemo(() => {
    if (!allHandsForCard) return new Map<number, number>();
    const counts = new Map<number, number>();

    for (const hand of allHandsForCard) {
      const cardHand: CardHand = {
        id: hand.id,
        categoryId: hand.categoryId,
        displayName: hand.displayName,
        displayPattern: hand.displayPattern,
        patternGroups: hand.patternGroups,
        isConcealed: hand.isConcealed,
        points: hand.points,
        notes: hand.notes,
        displayOrder: hand.displayOrder,
        examples: hand.examples || [],
        createdAt: new Date(),
      };
      const validation = validateHandExamples(cardHand);
      const current = counts.get(hand.categoryId) ?? 0;
      counts.set(hand.categoryId, current + validation.issueCount);
    }

    return counts;
  }, [allHandsForCard]);

  // Compute validation for current editing form (for real-time feedback)
  const editFormValidation = useMemo(() => {
    if (!editFormData) return null;
    // Create a CardHand-like object for validation
    const cardHand: CardHand = {
      id: selectedHandId ?? 0,
      categoryId: selectedCategoryId ?? 0,
      displayName: editFormData.displayName,
      displayPattern: editFormData.displayPattern,
      patternGroups: editFormData.patternGroups,
      isConcealed: editFormData.isConcealed,
      points: editFormData.points,
      notes: editFormData.notes || null,
      displayOrder: editFormData.displayOrder,
      examples: editFormData.examples,
      createdAt: new Date(), // Required by CardHand type but not used in validation
    };
    return validateHandExamples(cardHand);
  }, [editFormData, selectedHandId, selectedCategoryId]);

  const loadHandIntoForm = (hand: NonNullable<typeof hands>[number]) => {
    const derivedPattern = generateDisplayPattern(hand.patternGroups);
    const derivedSegments = generateDisplaySegments(hand.patternGroups);
    setEditFormData({
      displayName: hand.displayName,
      displayPattern: derivedPattern,
      displaySegments: derivedSegments,
      patternGroups: hand.patternGroups,
      isConcealed: hand.isConcealed,
      points: hand.points,
      notes: hand.notes || '',
      displayOrder: hand.displayOrder,
      examples: hand.examples || [],
    });
  };

  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
    setSelectedCategoryId(null);
    setSelectedHandId(null);
    setEditFormData(null);
    setIsCreatingNew(false);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedHandId(null);
    setEditFormData(null);
    setIsCreatingNew(false);
  };

  const handleHandSelect = (hand: NonNullable<typeof hands>[number]) => {
    setSelectedHandId(hand.id);
    setIsCreatingNew(false);
    loadHandIntoForm(hand);
  };

  const handleAddNewHand = () => {
    if (selectedCategoryId === null) return;
    setSelectedHandId(null);
    setIsCreatingNew(true);
    const nextOrder = (hands?.length || 0) + 1;
    const defaultGroups: PatternGroup[] = [
      { type: GroupType.PUNG, tile: { suitVar: 'A', constraints: { specificValues: [1] } } },
    ];
    setEditFormData({
      displayName: 'New Hand',
      displayPattern: generateDisplayPattern(defaultGroups),
      displaySegments: generateDisplaySegments(defaultGroups),
      patternGroups: defaultGroups,
      isConcealed: false,
      points: 25,
      notes: '',
      displayOrder: nextOrder,
      examples: [],
    });
  };

  const handleSave = () => {
    if (!editFormData || selectedCategoryId === null) return;

    if (editFormData.patternGroups.length === 0) {
      alert('At least one pattern group is required');
      return;
    }

    if (isCreatingNew) {
      createHand.mutate({
        categoryId: selectedCategoryId,
        displayName: editFormData.displayName,
        displayPattern: editFormData.displayPattern,
        patternGroups: editFormData.patternGroups,
        isConcealed: editFormData.isConcealed,
        points: editFormData.points,
        notes: editFormData.notes || null,
        displayOrder: editFormData.displayOrder,
        examples: editFormData.examples.length > 0 ? editFormData.examples : undefined,
      });
    } else if (selectedHandId !== null) {
      updateHand.mutate({
        id: selectedHandId,
        displayName: editFormData.displayName,
        displayPattern: editFormData.displayPattern,
        patternGroups: editFormData.patternGroups,
        isConcealed: editFormData.isConcealed,
        points: editFormData.points,
        notes: editFormData.notes || null,
        displayOrder: editFormData.displayOrder,
        examples: editFormData.examples.length > 0 ? editFormData.examples : undefined,
      });
    }
  };

  const handleDelete = () => {
    if (selectedHandId === null) return;
    const hand = hands?.find(h => h.id === selectedHandId);
    if (hand && confirm(`Delete "${hand.displayName}"? This cannot be undone.`)) {
      deleteHand.mutate({ id: selectedHandId });
    }
  };

  const handleCancel = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
      setEditFormData(null);
    } else if (selectedHandId !== null && hands) {
      const hand = hands.find(h => h.id === selectedHandId);
      if (hand) {
        loadHandIntoForm(hand);
      }
    }
  };

  const handleRebuildExamples = () => {
    if (!editFormData) return;
    try {
      const tiles = generateValidExample(editFormData.patternGroups);
      setEditFormData({
        ...editFormData,
        examples: [{ tiles, isValid: true }],
      });
    } catch (err) {
      console.error('Failed to generate example:', err);
      alert('Failed to generate example. Check console for details.');
    }
  };

  const handleClone = () => {
    if (!editFormData || selectedCategoryId === null) return;

    const newName = prompt('Enter name for the cloned hand:', `${editFormData.displayName} (Copy)`);
    if (!newName) return;

    const nextOrder = (hands?.length || 0) + 1;

    createHand.mutate({
      categoryId: selectedCategoryId,
      displayName: newName,
      displayPattern: editFormData.displayPattern,
      patternGroups: editFormData.patternGroups,
      isConcealed: editFormData.isConcealed,
      points: editFormData.points,
      notes: editFormData.notes || null,
      displayOrder: nextOrder,
      examples: editFormData.examples.length > 0 ? editFormData.examples : undefined,
    });
  };

  const renderSegments = (segments: DisplaySegment[]) => {
    return segments.map((segment, idx) => {
      let colorClass = classes.segmentNeutral;
      switch (segment.color) {
        case 'dot': colorClass = classes.segmentDot; break;
        case 'bam': colorClass = classes.segmentBam; break;
        case 'crak': colorClass = classes.segmentCrak; break;
        case 'wind': colorClass = classes.segmentWind; break;
        case 'dragon': colorClass = classes.segmentDragon; break;
        case 'flower': colorClass = classes.segmentFlower; break;
        case 'joker': colorClass = classes.segmentJoker; break;
      }
      // Add variable indicator (dotted underline) and tooltip for variable numbers
      const variableClass = segment.isVariable ? classes.segmentVariable : '';
      const title = segment.numberVar
        ? `Variable: groups with "${segment.numberVar}" must match`
        : segment.isVariable
        ? 'Variable number (any valid value)'
        : undefined;
      return (
        <span
          key={idx}
          className={`${colorClass} ${variableClass}`}
          title={title}
        >
          {segment.text}
        </span>
      );
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, handId: number) => {
    setDraggedHandId(handId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, handId: number) => {
    e.preventDefault();
    if (draggedHandId !== null && draggedHandId !== handId) {
      setDragOverHandId(handId);
    }
  };

  const handleDragLeave = () => {
    setDragOverHandId(null);
  };

  const handleDragEnd = () => {
    setDraggedHandId(null);
    setDragOverHandId(null);
  };

  const handleDrop = (e: React.DragEvent, targetHandId: number) => {
    e.preventDefault();
    if (!hands || draggedHandId === null || draggedHandId === targetHandId) {
      setDraggedHandId(null);
      setDragOverHandId(null);
      return;
    }

    // Create new order array
    const handIds = hands.map(h => h.id);
    const draggedIndex = handIds.indexOf(draggedHandId);
    const targetIndex = handIds.indexOf(targetHandId);

    // Remove dragged item and insert at target position
    handIds.splice(draggedIndex, 1);
    handIds.splice(targetIndex, 0, draggedHandId);

    // Update order in database
    reorderHands.mutate({ handIds });

    setDraggedHandId(null);
    setDragOverHandId(null);
  };

  // Category drag and drop handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: number) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (draggedCategoryId !== null && draggedCategoryId !== categoryId) {
      setDragOverCategoryId(categoryId);
    }
  };

  const handleCategoryDragLeave = () => {
    setDragOverCategoryId(null);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: number) => {
    e.preventDefault();
    if (!categories || draggedCategoryId === null || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      setDragOverCategoryId(null);
      return;
    }

    // Create new order array
    const categoryIds = categories.map(c => c.id);
    const draggedIndex = categoryIds.indexOf(draggedCategoryId);
    const targetIndex = categoryIds.indexOf(targetCategoryId);

    // Remove dragged item and insert at target position
    categoryIds.splice(draggedIndex, 1);
    categoryIds.splice(targetIndex, 0, draggedCategoryId);

    // Update order in database
    reorderCategoriesMutation.mutate({ categoryIds });

    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
  };

  return (
    <div className={classes.page}>
      {/* Header */}
      <div className={classes.header}>
        <h1 className={classes.title}>Card Manager</h1>
        <Link to="/" className={classes.backLink}>
          &larr; Back to Analyzer
        </Link>
      </div>

      {/* Four Panels */}
      <div className={classes.panels}>
        {/* Panel 1: Cards */}
        <div className={`${classes.panel} ${classes.panelNarrow}`}>
          <div className={classes.panelHeader}>
            <h2 className={classes.panelTitle}>Cards</h2>
          </div>
          <div className={classes.panelContent}>
            {cardsLoading ? (
              <div className={classes.loading}>Loading...</div>
            ) : cards && cards.length > 0 ? (
              cards.map((card) => (
                <div
                  key={card.id}
                  className={`${classes.listItem} ${selectedCardId === card.id ? classes.listItemSelected : ''}`}
                  onClick={() => handleCardSelect(card.id)}
                >
                  <span>{card.name || card.year}</span>
                  {card.isActive && <span className={classes.listItemActive}>Active</span>}
                </div>
              ))
            ) : (
              <div className={classes.empty}>No cards</div>
            )}
          </div>
          <div className={classes.panelFooter}>
            <button className={classes.addButton}>+ Add New</button>
          </div>
        </div>

        {/* Panel 2: Categories */}
        <div className={`${classes.panel} ${classes.panelMedium}`}>
          <div className={classes.panelHeader}>
            <h2 className={classes.panelTitle}>Categories</h2>
          </div>
          <div className={classes.panelContent}>
            {!selectedCardId ? (
              <div className={classes.empty}>Select a card</div>
            ) : categoriesLoading ? (
              <div className={classes.loading}>Loading...</div>
            ) : categories && categories.length > 0 ? (
              categories.map((category) => {
                const isDragging = draggedCategoryId === category.id;
                const isDragOver = dragOverCategoryId === category.id;
                const issueCount = categoryIssueCounts.get(category.id) ?? 0;
                return (
                  <div
                    key={category.id}
                    className={`${classes.categoryItem} ${selectedCategoryId === category.id ? classes.categoryItemSelected : ''} ${isDragging ? classes.categoryItemDragging : ''} ${isDragOver ? classes.categoryItemDragOver : ''}`}
                    onClick={() => handleCategorySelect(category.id)}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                    onDragOver={(e) => handleCategoryDragOver(e, category.id)}
                    onDragLeave={handleCategoryDragLeave}
                    onDragEnd={handleCategoryDragEnd}
                    onDrop={(e) => handleCategoryDrop(e, category.id)}
                  >
                    <span>{category.name}</span>
                    {issueCount > 0 && (
                      <span
                        className={`${classes.validationBadge} ${classes.validationBadgeSmall}`}
                        title={`${issueCount} example issue${issueCount > 1 ? 's' : ''} in this category`}
                      >
                        {issueCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={classes.empty}>No categories</div>
            )}
          </div>
          <div className={classes.panelFooter}>
            <button className={classes.addButton} disabled={!selectedCardId}>+ Add New</button>
          </div>
        </div>

        {/* Panel 3: Hands */}
        <div className={`${classes.panel} ${classes.panelWide}`}>
          <div className={classes.panelHeader}>
            <h2 className={classes.panelTitle}>Hands {hands && `(${hands.length})`}</h2>
          </div>
          <div className={classes.panelContent}>
            {!selectedCategoryId ? (
              <div className={classes.empty}>Select a category</div>
            ) : handsLoading ? (
              <div className={classes.loading}>Loading...</div>
            ) : hands && hands.length > 0 ? (
              hands.map((hand) => {
                const segments = generateDisplaySegments(hand.patternGroups);
                const patternText = generateDisplayPattern(hand.patternGroups);
                const charCount = patternText.replace(/\s/g, '').length;
                const isDragging = draggedHandId === hand.id;
                const isDragOver = dragOverHandId === hand.id;
                const validationResult = handValidationResults.get(hand.id);
                const hasValidationIssues = validationResult?.hasIssues ?? false;
                const validationIssueCount = validationResult?.issueCount ?? 0;
                return (
                  <div
                    key={hand.id}
                    className={`${classes.handItem} ${selectedHandId === hand.id ? classes.handItemSelected : ''} ${isDragging ? classes.handItemDragging : ''} ${isDragOver ? classes.handItemDragOver : ''}`}
                    onClick={() => handleHandSelect(hand)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, hand.id)}
                    onDragOver={(e) => handleDragOver(e, hand.id)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, hand.id)}
                  >
                    <h4 className={classes.handName}>
                      {hand.displayName}
                      {hasValidationIssues && (
                        <span
                          className={`${classes.validationBadge} ${classes.validationBadgeSmall}`}
                          title={`${validationIssueCount} example issue${validationIssueCount > 1 ? 's' : ''} need review`}
                        >
                          {validationIssueCount}
                        </span>
                      )}
                    </h4>
                    <p className={classes.handPattern}>
                      {renderSegments(segments)}
                      {hand.notes && <span className={classes.notesIcon} title={hand.notes}>i</span>}
                      {charCount !== 14 && (
                        <span className={classes.warningIcon} title={`${charCount} tiles (need 14)`}>!</span>
                      )}
                    </p>
                    <div className={classes.handMeta}>
                      <span className={`${classes.badge} ${classes.badgePoints}`}>{hand.points} pts</span>
                      {hand.isConcealed && (
                        <span className={`${classes.badge} ${classes.badgeConcealed}`}>C</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={classes.empty}>No hands</div>
            )}
          </div>
          <div className={classes.panelFooter}>
            <button className={classes.addButton} onClick={handleAddNewHand} disabled={!selectedCategoryId}>
              + Add New
            </button>
          </div>
        </div>

        {/* Panel 4: Hand Details */}
        <div className={`${classes.panel} ${classes.panelFlex}`}>
          <div className={classes.panelHeader}>
            <h2 className={classes.panelTitle}>
              {isCreatingNew ? 'New Hand' : editFormData ? 'Edit Hand' : 'Hand Details'}
            </h2>
          </div>
          {editFormData ? (
            <div className={classes.editPanelContent}>
              <div className={classes.editPanelForm}>
                {/* Header row: Name/Pattern on left, Points/Concealed/Notes on right */}
                <div className={classes.formHeader}>
                  <div className={classes.formHeaderLeft}>
                    {/* Display Name */}
                    <div className={classes.formGroup}>
                      <label className={classes.formLabel}>Display Name</label>
                      <input
                        type="text"
                        className={classes.formInput}
                        value={editFormData.displayName}
                        onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                      />
                    </div>

                    {/* Display Pattern Preview */}
                    <div className={classes.formGroup}>
                      <label className={classes.formLabel}>
                        Display Pattern
                        {(() => {
                          const count = editFormData.displayPattern.replace(/\s/g, '').length;
                          const isValid = count === 14;
                          return (
                            <span style={{
                              marginLeft: '8px',
                              fontWeight: 'normal',
                              color: isValid ? '#4CAF50' : '#FFA726',
                            }}>
                              ({count}/14 tiles{isValid ? ' ✓' : ' ⚠'})
                            </span>
                          );
                        })()}
                      </label>
                      <div className={classes.displayPatternPreview}>
                        {renderSegments(editFormData.displaySegments)}
                      </div>
                    </div>
                  </div>

                  <div className={classes.formHeaderRight}>
                    {/* Points and Type */}
                    <div className={classes.formHeaderRightRow}>
                      <label className={classes.formLabel} style={{ margin: 0, width: '80px' }}>Points</label>
                      <label className={classes.formLabel} style={{ margin: 0 }}>Type</label>
                    </div>
                    <div className={classes.formHeaderRightRow}>
                      <input
                        type="number"
                        className={classes.pointsInput}
                        style={{ width: '80px' }}
                        value={editFormData.points}
                        onChange={(e) => setEditFormData({ ...editFormData, points: parseInt(e.target.value) || 0 })}
                      />
                      <select
                        className={classes.formInput}
                        value={editFormData.isConcealed ? 'concealed' : 'exposed'}
                        onChange={(e) => setEditFormData({ ...editFormData, isConcealed: e.target.value === 'concealed' })}
                        style={{ flex: 1 }}
                      >
                        <option value="exposed">Exposed</option>
                        <option value="concealed">Concealed</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div style={{ width: '100%' }}>
                      <label className={classes.formLabel}>Notes</label>
                      <input
                        type="text"
                        className={classes.formInput}
                        value={editFormData.notes}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        placeholder="e.g., Any 1 Suit"
                      />
                    </div>
                  </div>
                </div>

                {/* Pattern Groups */}
                <div className={classes.formGroup}>
                  <label className={classes.formLabel}>Pattern Groups</label>
                  <PatternGroupEditor
                    groups={editFormData.patternGroups}
                    onChange={(groups) => setEditFormData({
                      ...editFormData,
                      patternGroups: groups,
                      displayPattern: generateDisplayPattern(groups),
                      displaySegments: generateDisplaySegments(groups),
                    })}
                  />
                </div>

                {/* Examples */}
                <div className={classes.formGroup}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className={classes.formLabel} style={{ margin: 0 }}>
                      Examples
                      <span style={{ marginLeft: '8px', fontWeight: 'normal', color: '#666', fontSize: '11px' }}>
                        ({editFormData.examples.filter(e => e.isValid).length} valid, {editFormData.examples.filter(e => !e.isValid).length} invalid)
                      </span>
                    </label>
                    <button
                      className={classes.cancelButton}
                      onClick={handleRebuildExamples}
                      title="Delete all examples and generate one valid example"
                    >
                      Rebuild Examples
                    </button>
                  </div>
                  <ExampleEditor
                    examples={editFormData.examples}
                    patternGroups={editFormData.patternGroups}
                    onChange={(examples) => setEditFormData({ ...editFormData, examples })}
                    validationResults={editFormValidation?.exampleResults}
                  />
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div className={classes.formActions}>
                <button
                  className={classes.saveButton}
                  onClick={handleSave}
                  disabled={updateHand.isPending || createHand.isPending}
                >
                  {updateHand.isPending || createHand.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  className={classes.cloneButton}
                  onClick={handleClone}
                  disabled={createHand.isPending}
                >
                  Clone
                </button>
                <button className={classes.cancelButton} onClick={handleCancel}>
                  Cancel
                </button>
                {!isCreatingNew && selectedHandId && (
                  <button
                    className={classes.deleteButton}
                    onClick={handleDelete}
                    disabled={deleteHand.isPending}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={classes.panelContent}>
              <div className={classes.detailEmpty}>
                Select a hand to edit
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
