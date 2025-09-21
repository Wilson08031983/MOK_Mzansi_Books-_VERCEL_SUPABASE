# Email Asset Migration Plan

## Current State Analysis

### Email Assets Location
- **Current Path**: `/public/email-assets/`
- **Assets Available**:
  - `logo.png` - Main company logo
  - `signature.png` - Wilson Moabelo signature
  - `Facebook.png` - Facebook social icon
  - `twitter.png` - Twitter/X social icon
  - `tiktok.png` - TikTok social icon

### Current Issues
1. Email assets are served from the main domain which may have authentication requirements
2. Some email templates may reference hardcoded URLs
3. Email clients may block images from authenticated domains

## Migration Strategy

### Option 1: Use Primary Domain (Recommended for Now)
- **Pros**: Simple implementation, no additional setup required
- **Cons**: May face authentication issues in email clients
- **Implementation**: Update all templates to use `https://www.mokmzansibooks.com/email-assets/`

### Option 2: Dedicated Static Subdomain (Future Enhancement)
- **Subdomain**: `static.mokmzansibooks.com`
- **Pros**: No authentication issues, better email client compatibility
- **Cons**: Requires DNS configuration and separate hosting setup

## Implementation Steps

### Phase 1: Update Templates to Use Primary Domain
1. ✅ Update `emailConfig.ts` vercelUrl to `https://www.mokmzansibooks.com`
2. ✅ Update `postmark-base-template.html` logo reference
3. Update any remaining template files with hardcoded URLs
4. Test email rendering with new URLs

### Phase 2: Verify Asset Accessibility
1. Test all email assets are accessible at new URLs
2. Verify no authentication is required for `/email-assets/` path
3. Test email rendering in various email clients

### Phase 3: Future Static Subdomain Setup (Optional)
1. Configure DNS for `static.mokmzansibooks.com`
2. Set up CDN or static hosting for assets
3. Update all templates to use static subdomain
4. Implement asset versioning for cache busting

## Template Files to Update

### HTML Templates
- `src/emails/templates/postmark-base-template.html` ✅
- Any other HTML templates in `src/emails/templates/`
- Test HTML files in `public/` directory

### React/TSX Templates
- `src/emails/templates/*.tsx` files
- Check for hardcoded asset URLs in React components

### Configuration Files
- `src/emails/config/emailConfig.ts` ✅
- Any other configuration files referencing assets

## Asset URL Patterns

### Current Pattern
```
https://www.mokmzansibooks.com/email-assets/[asset-name]
```

### Future Static Subdomain Pattern
```
https://static.mokmzansibooks.com/[asset-name]
```

## Testing Checklist

### Email Rendering Tests
- [ ] Welcome email with logo
- [ ] Invoice email with company branding
- [ ] Quotation email with signature
- [ ] Social media icons display correctly
- [ ] All images load without authentication prompts

### Email Client Compatibility
- [ ] Gmail (web and mobile)
- [ ] Outlook (web and desktop)
- [ ] Apple Mail
- [ ] Thunderbird
- [ ] Mobile email clients

### Asset Accessibility Tests
- [ ] Direct URL access to each asset
- [ ] No authentication required for asset access
- [ ] Proper MIME types served
- [ ] CORS headers if needed

## Security Considerations

### Asset Access
- Ensure email assets are publicly accessible
- No authentication required for `/email-assets/` path
- Consider rate limiting to prevent abuse

### Content Security
- Validate all uploaded assets
- Implement proper file type restrictions
- Regular security scans of asset directory

## Monitoring and Maintenance

### Performance Monitoring
- Track asset load times
- Monitor email delivery rates
- Check for broken image reports

### Regular Updates
- Keep assets optimized for email clients
- Update social media icons as needed
- Maintain consistent branding across all templates

## Rollback Plan

If issues arise with the new asset URLs:
1. Revert templates to use relative paths
2. Ensure assets are accessible from main domain
3. Investigate and resolve authentication issues
4. Re-deploy with corrected configuration

## Success Metrics

- [ ] All email templates render correctly
- [ ] No broken images in sent emails
- [ ] Email delivery rates maintained or improved
- [ ] No authentication errors for asset access
- [ ] Positive feedback from email recipients