# I18N Implementation Testing Guide

## Implementation Summary

This document describes the I18N (Internationalization) implementation for the seethbotsite project, supporting English, Chinese (Simplified), and Japanese.

### What Was Implemented

1. **vue-i18n Integration**
   - Installed vue-i18n@9 (will need to upgrade to v11 in future)
   - Created i18n configuration in `config/i18n.ts`
   - Integrated i18n plugin into the main app

2. **Translation Files**
   - Created locale files for 3 languages:
     - `locales/en.json` - English
     - `locales/zh.json` - Chinese (Simplified)
     - `locales/ja.json` - Japanese
   - Covered common UI elements, navigation, auth, tickets, panels, keyboard shortcuts, quotes, and language settings

3. **Language Selector Components**
   - `LanguageSelector.vue` - Compact dropdown selector for quick access
   - `LanguageSettings.vue` - Full settings panel component

4. **UI Integration**
   - Added LanguageSelector to Breadcrumb component (visible on all pages with breadcrumbs)
   - Added LanguageSettings to SettingsPage
   - Language preference persists in localStorage
   - Auto-detects browser locale on first visit

5. **Enhanced useLanguage Composable**
   - Maintained backward compatibility with existing US/AU spelling variations
   - Added i18n support methods (t, changeLocale, availableLocales, etc.)
   - Provides both legacy and new i18n functionality

### How It Works

1. **Automatic Locale Detection**
   - On first visit, the app checks localStorage for saved locale
   - If not found, it detects the browser's language preference
   - Falls back to English if no match is found

2. **Language Switching**
   - Users can change language via:
     - Quick selector in breadcrumb (all pages except home)
     - Settings page with full language options
   - Change is immediate and persists across sessions

3. **Translation System**
   - Uses vue-i18n's Composition API mode
   - Translations are accessed via `$t('key')` in templates
   - Supports nested keys (e.g., `common.loading`)
   - Fallback to English if translation is missing

4. **Persistence**
   - Selected locale is saved to localStorage under the 'locale' key
   - On page reload, the saved locale is restored
   - HTML lang attribute is updated dynamically

### Testing Checklist

#### Basic Functionality
- [ ] Build completes successfully
- [ ] Dev server starts without errors
- [ ] No TypeScript errors in the build

#### Language Switching
- [ ] Can switch between English, Chinese, and Japanese
- [ ] Language change is immediate
- [ ] Language preference persists after page refresh
- [ ] Language preference persists after browser restart

#### UI Components
- [ ] LanguageSelector appears in breadcrumb on non-home pages
- [ ] LanguageSelector dropdown opens and closes correctly
- [ ] LanguageSelector shows correct flag and language name
- [ ] LanguageSettings appears on settings page
- [ ] LanguageSettings shows all 3 language options
- [ ] Selected language is highlighted in both components

#### Translations
- [ ] English translations display correctly
- [ ] Chinese translations display correctly
- [ ] Japanese translations display correctly
- [ ] All translated strings are visible and readable
- [ ] No untranslated text in critical UI elements

#### Browser Detection
- [ ] App detects browser locale on first visit
- [ ] Falls back to English if browser locale not supported
- [ ] HTML lang attribute updates correctly

#### Responsive Design
- [ ] LanguageSelector works on mobile devices
- [ ] LanguageSettings works on mobile devices
- [ ] Layout doesn't break on small screens
- [ ] Dropdown menus are accessible on touch devices

#### Dark/Light Mode
- [ ] LanguageSelector looks good in dark mode
- [ ] LanguageSelector looks good in light mode
- [ ] LanguageSettings looks good in dark mode
- [ ] LanguageSettings looks good in light mode

### Manual Testing Steps

1. **Open the application**
   ```bash
   cd /home/seethbotsite/frontend
   npm run dev
   ```
   Navigate to http://localhost:3000

2. **Test language switching**
   - Go to any page other than home (e.g., /settings)
   - Click the language selector in the breadcrumb
   - Select each language (EN, ZH, JA)
   - Verify translations update immediately

3. **Test persistence**
   - Select Chinese
   - Refresh the page
   - Verify Chinese is still selected
   - Close and reopen the browser
   - Verify Chinese is still selected

4. **Test settings page**
   - Navigate to /settings
   - Find the Language section
   - Click each language option
   - Verify the selection updates
   - Verify the checkmark appears on the selected language

5. **Test browser detection**
   - Clear localStorage (or use incognito mode)
   - Set browser language to Chinese
   - Reload the page
   - Verify Chinese is selected automatically

6. **Test on mobile**
   - Open the app on a mobile device or use browser dev tools
   - Resize viewport to mobile width
   - Test language switching on mobile
   - Verify dropdown and settings work on touch

### Known Issues / Future Improvements

1. **vue-i18n Version**
   - Currently using v9, which is deprecated
   - Should upgrade to v11 when possible
   - Breaking changes may be required

2. **Translation Coverage**
   - Not all UI text has been translated yet
   - Need to systematically add more translations as needed
   - Some dynamic content may need special handling

3. **RTL Support**
   - Arabic and Hebrew (RTL languages) not yet supported
   - Would need additional CSS and layout adjustments

4. **Number/Date Formatting**
   - Could add locale-specific number and date formatting
   - vue-i18n has built-in support for this

5. **Pluralization**
   - Translation files don't include pluralization rules yet
   - vue-i18n supports complex pluralization patterns

6. **Missing Translations**
   - Some UI text may still be hardcoded
   - Need to audit and add more translation keys
   - Consider adding a "missing translation" warning in dev mode

### Files Modified/Created

#### Created:
- `config/i18n.ts` - i18n configuration
- `locales/en.json` - English translations
- `locales/zh.json` - Chinese translations
- `locales/ja.json` - Japanese translations
- `components/shared/ui/LanguageSelector.vue` - Compact language selector
- `components/settings/LanguageSettings.vue` - Settings page language selector
- `I18N_TESTING.md` - This testing guide

#### Modified:
- `main.ts` - Added i18n plugin integration
- `composables/useLanguage.ts` - Enhanced with i18n support
- `components/shared/Breadcrumb.vue` - Added LanguageSelector
- `components/pages/SettingsPage.vue` - Added LanguageSettings

### Deployment Notes

1. The build completes successfully
2. No breaking changes to existing functionality
3. Language preference is optional - defaults to English
4. Backward compatible with existing US/AU spelling variations

### Support

For issues or questions:
1. Check browser console for errors
2. Verify i18n plugin is loaded in main.ts
3. Check that locale files exist in the locales/ directory
4. Verify localStorage is enabled and accessible
