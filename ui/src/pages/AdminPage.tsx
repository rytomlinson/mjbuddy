import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import { trpc } from '../trpc';
import type { Theme } from '../theme';
import type { PatternGroup } from 'common';

const useStyles = createUseStyles((theme: Theme) => ({
  page: {
    padding: theme.spacing.lg,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.colors.text,
    margin: 0,
  },
  backLink: {
    color: theme.colors.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  yearSelector: {
    display: 'flex',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  yearButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
    },
  },
  yearButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: 'white',
  },
  categoryTabs: {
    display: 'flex',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
    paddingBottom: theme.spacing.sm,
  },
  categoryTab: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.fontSizes.sm,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
    },
  },
  categoryTabActive: {
    backgroundColor: theme.colors.primary,
    color: 'white',
  },
  handsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  handCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.border}`,
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
    },
  },
  handCardEditing: {
    borderColor: theme.colors.primary,
    boxShadow: '0 0 8px rgba(184, 74, 74, 0.3)',
  },
  handHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  handName: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    margin: 0,
  },
  handPattern: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    margin: `${theme.spacing.xs} 0`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  notesIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: theme.colors.textMuted,
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'help',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  handMeta: {
    display: 'flex',
    gap: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  badge: {
    padding: `2px ${theme.spacing.xs}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: '11px',
    fontWeight: 'bold',
  },
  badgeConcealed: {
    backgroundColor: 'rgba(142, 36, 170, 0.2)',
    color: '#CE93D8',
  },
  badgePoints: {
    backgroundColor: 'rgba(184, 74, 74, 0.2)',
    color: theme.colors.primary,
  },
  actions: {
    display: 'flex',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
    },
  },
  actionButtonDanger: {
    '&:hover': {
      borderColor: theme.colors.error,
      color: theme.colors.error,
    },
  },
  editForm: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.border}`,
  },
  formRow: {
    display: 'flex',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  formGroup: {
    flex: 1,
  },
  formLabel: {
    display: 'block',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  formInput: {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    boxSizing: 'border-box',
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  formTextarea: {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontFamily: 'monospace',
    minHeight: '100px',
    resize: 'vertical',
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
  },
  formActions: {
    display: 'flex',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  saveButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
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
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    cursor: 'pointer',
    fontSize: theme.fontSizes.sm,
    '&:hover': {
      borderColor: theme.colors.textSecondary,
    },
  },
  loading: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    padding: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    padding: theme.spacing.md,
  },
  empty: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    padding: theme.spacing.md,
    textAlign: 'center',
  },
}));

interface EditFormData {
  displayName: string;
  displayPattern: string;
  patternGroups: string; // JSON string for editing
  isConcealed: boolean;
  points: number;
  notes: string;
  displayOrder: number;
}

export function AdminPage() {
  const classes = useStyles();

  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingHandId, setEditingHandId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);

  // Fetch card years
  const { data: years, isLoading: yearsLoading } = trpc.cardYear.list.useQuery();

  // Fetch categories for selected year
  const { data: categories, isLoading: categoriesLoading } = trpc.cardHand.listCategories.useQuery(
    { cardYearId: selectedYearId! },
    { enabled: selectedYearId !== null }
  );

  // Fetch hands for selected category
  const { data: hands, isLoading: handsLoading, refetch: refetchHands } = trpc.cardHand.listByCategory.useQuery(
    { categoryId: selectedCategoryId! },
    { enabled: selectedCategoryId !== null }
  );

  // Mutations
  const updateHand = trpc.cardHand.update.useMutation({
    onSuccess: () => {
      refetchHands();
      setEditingHandId(null);
      setEditFormData(null);
    },
  });

  const deleteHand = trpc.cardHand.delete.useMutation({
    onSuccess: () => {
      refetchHands();
    },
  });

  // Auto-select first year
  if (years && years.length > 0 && selectedYearId === null) {
    setSelectedYearId(years[0].id);
  }

  // Auto-select first category when year changes
  if (categories && categories.length > 0 && selectedCategoryId === null) {
    setSelectedCategoryId(categories[0].id);
  }

  const handleEditClick = (hand: NonNullable<typeof hands>[number]) => {
    setEditingHandId(hand.id);
    setEditFormData({
      displayName: hand.displayName,
      displayPattern: hand.displayPattern,
      patternGroups: JSON.stringify(hand.patternGroups, null, 2),
      isConcealed: hand.isConcealed,
      points: hand.points,
      notes: hand.notes || '',
      displayOrder: hand.displayOrder,
    });
  };

  const handleCancelEdit = () => {
    setEditingHandId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (!editFormData || editingHandId === null) return;

    let patternGroups: PatternGroup[];
    try {
      patternGroups = JSON.parse(editFormData.patternGroups);
    } catch {
      alert('Invalid JSON in pattern groups');
      return;
    }

    updateHand.mutate({
      id: editingHandId,
      displayName: editFormData.displayName,
      displayPattern: editFormData.displayPattern,
      patternGroups,
      isConcealed: editFormData.isConcealed,
      points: editFormData.points,
      notes: editFormData.notes || null,
      displayOrder: editFormData.displayOrder,
    });
  };

  const handleDeleteClick = (hand: NonNullable<typeof hands>[number]) => {
    if (confirm(`Delete "${hand.displayName}"? This cannot be undone.`)) {
      deleteHand.mutate({ id: hand.id });
    }
  };

  const handleYearChange = (yearId: number) => {
    setSelectedYearId(yearId);
    setSelectedCategoryId(null);
    setEditingHandId(null);
    setEditFormData(null);
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setEditingHandId(null);
    setEditFormData(null);
  };

  return (
    <div className={classes.page}>
      <div className={classes.header}>
        <h1 className={classes.title}>Card Hands Admin</h1>
        <Link to="/" className={classes.backLink}>
          &larr; Back to Analyzer
        </Link>
      </div>

      {/* Year Selection */}
      <div className={classes.section}>
        <h2 className={classes.sectionTitle}>Card Year</h2>
        {yearsLoading ? (
          <div className={classes.loading}>Loading years...</div>
        ) : years && years.length > 0 ? (
          <div className={classes.yearSelector}>
            {years.map((year) => (
              <button
                key={year.id}
                className={`${classes.yearButton} ${selectedYearId === year.id ? classes.yearButtonActive : ''}`}
                onClick={() => handleYearChange(year.id)}
              >
                {year.year} {year.isActive && '(Active)'}
              </button>
            ))}
          </div>
        ) : (
          <div className={classes.empty}>No card years found</div>
        )}
      </div>

      {/* Categories and Hands */}
      {selectedYearId && (
        <div className={classes.section}>
          <h2 className={classes.sectionTitle}>
            Hands
            {categories && selectedCategoryId && (
              <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#888' }}>
                ({hands?.length || 0} hands)
              </span>
            )}
          </h2>

          {/* Category Tabs */}
          {categoriesLoading ? (
            <div className={classes.loading}>Loading categories...</div>
          ) : categories && categories.length > 0 ? (
            <div className={classes.categoryTabs}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${classes.categoryTab} ${selectedCategoryId === category.id ? classes.categoryTabActive : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : (
            <div className={classes.empty}>No categories found</div>
          )}

          {/* Hands List */}
          {selectedCategoryId && (
            handsLoading ? (
              <div className={classes.loading}>Loading hands...</div>
            ) : hands && hands.length > 0 ? (
              <div className={classes.handsList}>
                {hands.map((hand) => (
                  <div
                    key={hand.id}
                    className={`${classes.handCard} ${editingHandId === hand.id ? classes.handCardEditing : ''}`}
                  >
                    <div className={classes.handHeader}>
                      <div>
                        <h3 className={classes.handName}>{hand.displayName}</h3>
                        <p className={classes.handPattern}>
                          {hand.displayPattern}
                          {hand.notes && (
                            <span className={classes.notesIcon} title={hand.notes}>&#8505;</span>
                          )}
                        </p>
                        <div className={classes.handMeta}>
                          <span className={`${classes.badge} ${classes.badgePoints}`}>
                            {hand.points} pts
                          </span>
                          {hand.isConcealed && (
                            <span className={`${classes.badge} ${classes.badgeConcealed}`}>
                              Concealed
                            </span>
                          )}
                          <span>Order: {hand.displayOrder}</span>
                        </div>
                      </div>
                      <div className={classes.actions}>
                        {editingHandId !== hand.id && (
                          <>
                            <button
                              className={classes.actionButton}
                              onClick={() => handleEditClick(hand)}
                            >
                              Edit
                            </button>
                            <button
                              className={`${classes.actionButton} ${classes.actionButtonDanger}`}
                              onClick={() => handleDeleteClick(hand)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingHandId === hand.id && editFormData && (
                      <div className={classes.editForm}>
                        <div className={classes.formRow}>
                          <div className={classes.formGroup}>
                            <label className={classes.formLabel}>Display Name</label>
                            <input
                              type="text"
                              className={classes.formInput}
                              value={editFormData.displayName}
                              onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                            />
                          </div>
                          <div className={classes.formGroup}>
                            <label className={classes.formLabel}>Points</label>
                            <input
                              type="number"
                              className={classes.formInput}
                              value={editFormData.points}
                              onChange={(e) => setEditFormData({ ...editFormData, points: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className={classes.formGroup}>
                            <label className={classes.formLabel}>Display Order</label>
                            <input
                              type="number"
                              className={classes.formInput}
                              value={editFormData.displayOrder}
                              onChange={(e) => setEditFormData({ ...editFormData, displayOrder: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className={classes.formGroup}>
                          <label className={classes.formLabel}>Display Pattern</label>
                          <input
                            type="text"
                            className={classes.formInput}
                            value={editFormData.displayPattern}
                            onChange={(e) => setEditFormData({ ...editFormData, displayPattern: e.target.value })}
                          />
                        </div>

                        <div className={classes.formGroup}>
                          <label className={classes.formLabel}>Pattern Groups (JSON)</label>
                          <textarea
                            className={classes.formTextarea}
                            value={editFormData.patternGroups}
                            onChange={(e) => setEditFormData({ ...editFormData, patternGroups: e.target.value })}
                          />
                        </div>

                        <div className={classes.formRow}>
                          <div className={classes.formGroup}>
                            <label className={classes.formLabel}>Notes</label>
                            <input
                              type="text"
                              className={classes.formInput}
                              value={editFormData.notes}
                              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                            />
                          </div>
                          <div className={classes.formGroup}>
                            <label className={classes.formCheckbox}>
                              <input
                                type="checkbox"
                                checked={editFormData.isConcealed}
                                onChange={(e) => setEditFormData({ ...editFormData, isConcealed: e.target.checked })}
                              />
                              Concealed Hand
                            </label>
                          </div>
                        </div>

                        <div className={classes.formActions}>
                          <button
                            className={classes.saveButton}
                            onClick={handleSaveEdit}
                            disabled={updateHand.isPending}
                          >
                            {updateHand.isPending ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            className={classes.cancelButton}
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={classes.empty}>No hands in this category</div>
            )
          )}
        </div>
      )}
    </div>
  );
}
