type ThemeTokens = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
};

type TenantThemeDocument = {
  tenantId: string;
  tokens: Partial<ThemeTokens>;
  updatedAt: Date;
};

const DEFAULT_THEME: ThemeTokens = {
  primary: '#2d5bff',
  secondary: '#f4f6fb',
  background: '#ffffff',
  surface: '#ffffff',
  text: '#0f172a',
};

/**
 * Loads the tenant theme from MongoDB and merges it with defaults so the widget
 * and dashboard use consistent CSS variables everywhere.
 */
export async function loadTenantTheme(collection: {
  findOne(query: { tenantId: string }): Promise<TenantThemeDocument | null>;
}, tenantId: string): Promise<ThemeTokens> {
  if (!tenantId) throw new Error('Missing tenantId for theme lookup.');

  const doc = await collection.findOne({ tenantId });
  if (!doc) {
    return DEFAULT_THEME;
  }

  return {
    ...DEFAULT_THEME,
    ...doc.tokens,
  };
}
