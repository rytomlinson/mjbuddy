import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { trpc } from '../trpc';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  selectItems,
  selectItemsLoading,
  setItems,
  setLoading,
  addItem,
  removeItem,
} from '../slices/itemSlice';
import type { Theme } from '../theme';

const useStyles = createUseStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing.lg,
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    margin: 0,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.md,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
    '&:active': {
      backgroundColor: theme.colors.primaryActive,
    },
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    display: 'block',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.xs,
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSizes.md,
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  textarea: {
    width: '100%',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSizes.md,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
    '&:focus': {
      outline: 'none',
      borderColor: theme.colors.primary,
    },
  },
  formActions: {
    display: 'flex',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.md,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
    },
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.md,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colors.primaryHover,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: theme.colors.surfaceHover,
    },
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    margin: 0,
    marginBottom: theme.spacing.xs,
  },
  itemDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    margin: 0,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    color: theme.colors.error,
    border: 'none',
    padding: theme.spacing.xs,
    cursor: 'pointer',
    fontSize: theme.fontSizes.md,
    '&:hover': {
      opacity: 0.8,
    },
  },
  loading: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    padding: theme.spacing.xl,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
  },
}));

export function ItemList() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const loading = useAppSelector(selectItemsLoading);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = trpc.item.list.useQuery();
  const createMutation = trpc.item.create.useMutation();
  const deleteMutation = trpc.item.delete.useMutation();

  useEffect(() => {
    dispatch(setLoading(isLoading));
    if (data) {
      // tRPC serializes dates as strings, cast to match Item type
      dispatch(setItems(data as unknown as Parameters<typeof setItems>[0]));
    }
  }, [data, isLoading, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem = await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || null,
    });

    dispatch(addItem(newItem as unknown as Parameters<typeof addItem>[0]));
    setName('');
    setDescription('');
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    dispatch(removeItem(id));
  };

  if (loading || isLoading) {
    return <div className={classes.loading}>Loading...</div>;
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1 className={classes.title}>Items</h1>
        <button className={classes.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.inputGroup}>
            <label className={classes.label}>Name</label>
            <input
              type="text"
              className={classes.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              autoFocus
            />
          </div>
          <div className={classes.inputGroup}>
            <label className={classes.label}>Description (optional)</label>
            <textarea
              className={classes.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className={classes.formActions}>
            <button
              type="button"
              className={classes.cancelButton}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={classes.submitButton}
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className={classes.empty}>No items yet. Click "Add Item" to create one.</div>
      ) : (
        <ul className={classes.list}>
          {items.map((item) => (
            <li key={item.id} className={classes.listItem}>
              <div className={classes.itemContent}>
                <h3 className={classes.itemName}>{item.name}</h3>
                {item.description && (
                  <p className={classes.itemDescription}>{item.description}</p>
                )}
              </div>
              <button
                className={classes.deleteButton}
                onClick={() => handleDelete(item.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
