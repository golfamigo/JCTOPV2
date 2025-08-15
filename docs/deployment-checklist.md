# Production Deployment Checklist

## Pre-Deployment Verification

### Code Quality Checks

#### Code Review
- [ ] All pull requests approved by at least 2 reviewers
- [ ] No unresolved comments in pull requests
- [ ] Code follows established patterns and conventions
- [ ] No TODO comments in production code
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets or API keys
- [ ] All debug code removed or disabled

#### Testing
- [ ] All unit tests passing (80%+ coverage)
- [ ] All integration tests passing
- [ ] User acceptance testing completed
- [ ] Regression testing completed
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Accessibility testing completed (WCAG 2.1 AA)

#### Linting and Type Checking
```bash
# Run these commands and ensure all pass
npm run lint
npm run typecheck
npm test -- --coverage
```

### Build Verification

#### Build Commands
```bash
# Development build test
npx expo export --platform all

# Production build test
eas build --platform all --profile production --local
```

#### Build Checklist
- [ ] Build completes without errors
- [ ] Build size is within acceptable limits (<50MB)
- [ ] All assets are included correctly
- [ ] Splash screen displays correctly
- [ ] App icon appears correctly
- [ ] Build version number updated
- [ ] Build number incremented

### Environment Configuration

#### Environment Variables

**Production API Configuration:**
```env
# .env.production
EXPO_PUBLIC_API_URL=https://jctop.zeabur.app/api/v1
EXPO_PUBLIC_ENVIRONMENT=production
```

**Required Environment Variables:**
- [ ] `EXPO_PUBLIC_API_URL` - Production API endpoint
- [ ] `EXPO_PUBLIC_ENVIRONMENT` - Set to "production"
- [ ] `SENTRY_DSN` - Error tracking (if using Sentry)
- [ ] `ANALYTICS_ID` - Analytics tracking ID (if applicable)
- [ ] `PUSH_NOTIFICATION_KEY` - Push notification service key

#### Configuration Files

**app.json / app.config.js:**
- [ ] Bundle identifier correct (com.jctop.app)
- [ ] Version number updated (semantic versioning)
- [ ] Build number incremented
- [ ] Splash screen configured
- [ ] App icon configured
- [ ] Permissions configured correctly
- [ ] Deep linking configured (if applicable)

**eas.json:**
```json
{
  "build": {
    "production": {
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://jctop.zeabur.app/api/v1",
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  }
}
```

## Performance Benchmarks

### App Performance Metrics

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| App Launch Time | < 3s | ___ | [ ] |
| First Contentful Paint | < 2s | ___ | [ ] |
| Time to Interactive | < 3.5s | ___ | [ ] |
| Bundle Size (iOS) | < 50MB | ___ | [ ] |
| Bundle Size (Android) | < 40MB | ___ | [ ] |
| Memory Usage (Idle) | < 150MB | ___ | [ ] |
| Memory Usage (Active) | < 250MB | ___ | [ ] |
| List Scroll FPS | > 55fps | ___ | [ ] |
| Animation FPS | 60fps | ___ | [ ] |
| API Response Time (avg) | < 500ms | ___ | [ ] |

### Network Performance
- [ ] All images optimized (WebP format where supported)
- [ ] API calls use caching appropriately
- [ ] Pagination implemented for large lists
- [ ] Lazy loading implemented for heavy components
- [ ] Offline mode handles gracefully

## Security Checks

### Authentication & Authorization
- [ ] JWT tokens expire appropriately
- [ ] Refresh token mechanism working
- [ ] Session timeout implemented
- [ ] Password requirements enforced
- [ ] Rate limiting on authentication endpoints

### Data Security
- [ ] All API calls use HTTPS
- [ ] Sensitive data encrypted in storage
- [ ] No sensitive data in logs
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified
- [ ] XSS prevention implemented

### App Security
- [ ] Certificate pinning enabled (if applicable)
- [ ] Jailbreak/root detection (if required)
- [ ] Code obfuscation enabled
- [ ] ProGuard rules configured (Android)
- [ ] App Transport Security configured (iOS)

### API Security
- [ ] API keys secured and not exposed
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Request validation in place
- [ ] Error messages don't expose sensitive info

## Platform-Specific Checks

### iOS Deployment

#### App Store Requirements
- [ ] App Store Connect account configured
- [ ] App listing information complete
- [ ] Screenshots for all required devices
- [ ] App preview video (optional)
- [ ] Privacy policy URL provided
- [ ] Terms of service URL provided
- [ ] Age rating questionnaire completed
- [ ] Export compliance information provided

#### iOS Specific Testing
- [ ] Tested on iPhone (multiple models)
- [ ] Tested on iPad (if applicable)
- [ ] Tested on iOS 13+ versions
- [ ] Face ID/Touch ID working (if applicable)
- [ ] Push notifications working
- [ ] Deep linking working
- [ ] Universal links configured

### Android Deployment

#### Google Play Requirements
- [ ] Google Play Console account configured
- [ ] App listing information complete
- [ ] Feature graphic uploaded
- [ ] Screenshots for phones and tablets
- [ ] Content rating questionnaire completed
- [ ] Target API level meets requirements (33+)
- [ ] Privacy policy URL provided
- [ ] Data safety form completed

#### Android Specific Testing
- [ ] Tested on multiple Android versions (8+)
- [ ] Tested on different screen sizes
- [ ] Back button behavior correct
- [ ] Push notifications working
- [ ] Deep linking working
- [ ] App links configured

## Monitoring and Logging Setup

### Error Tracking
- [ ] Sentry/Crashlytics configured
- [ ] Source maps uploaded
- [ ] Error alerting configured
- [ ] Error grouping rules set
- [ ] Performance monitoring enabled

### Analytics
- [ ] Analytics SDK integrated
- [ ] Key events tracked
- [ ] User properties configured
- [ ] Conversion events defined
- [ ] Dashboard configured

### Logging
- [ ] Logging service configured
- [ ] Log levels appropriate for production
- [ ] Sensitive data filtered from logs
- [ ] Log retention policy set
- [ ] Alert rules configured

## Database and Backend

### Database Checks
- [ ] Database migrations completed
- [ ] Indexes optimized
- [ ] Backup strategy in place
- [ ] Restore procedure tested
- [ ] Connection pooling configured

### API Health
- [ ] All endpoints responding correctly
- [ ] Rate limiting configured
- [ ] Caching headers set correctly
- [ ] Error handling consistent
- [ ] API documentation updated

## Rollback Procedures

### Rollback Plan

#### Immediate Rollback Triggers
- [ ] App crash rate > 2%
- [ ] API error rate > 5%
- [ ] Critical functionality broken
- [ ] Security vulnerability discovered
- [ ] Data corruption detected

#### Rollback Steps
1. **Notify team** of rollback decision
2. **Stop new deployments** immediately
3. **For App Store/Play Store:**
   - Submit expedited review for previous version
   - Use phased rollout pause (if available)
   - Communicate with users via in-app message
4. **For API/Backend:**
   ```bash
   # Revert to previous deployment
   git revert <commit-hash>
   git push origin main
   
   # Or use deployment platform rollback
   eas update --branch production --rollback
   ```
5. **Verify rollback** successful
6. **Post-mortem** meeting scheduled

### Backup Verification
- [ ] Database backup available
- [ ] Previous app version archived
- [ ] Previous API version tagged
- [ ] Configuration backup available
- [ ] Recovery time objective (RTO) < 4 hours
- [ ] Recovery point objective (RPO) < 1 hour

## Post-Deployment Verification

### Immediate Checks (First 30 minutes)
- [ ] App launches successfully
- [ ] Login/Registration working
- [ ] Core features functional
- [ ] Payment processing working
- [ ] No spike in error rates
- [ ] No spike in crash rates

### First Hour Monitoring
- [ ] Monitor error tracking dashboard
- [ ] Check API response times
- [ ] Verify database performance
- [ ] Monitor memory usage
- [ ] Check user feedback channels
- [ ] Review app store reviews

### First 24 Hours
- [ ] Daily active users tracking normally
- [ ] Conversion rates stable
- [ ] No unusual patterns in analytics
- [ ] Customer support tickets normal
- [ ] Performance metrics within targets
- [ ] No security alerts triggered

### Success Criteria
- [ ] Crash rate < 1%
- [ ] API success rate > 99%
- [ ] User ratings maintained or improved
- [ ] No critical bugs reported
- [ ] Performance metrics met
- [ ] Business metrics stable

## Communication Plan

### Internal Communication
- [ ] Deployment schedule communicated to team
- [ ] Slack/Teams channel monitoring assigned
- [ ] On-call engineer designated
- [ ] Escalation path defined
- [ ] Post-deployment meeting scheduled

### External Communication
- [ ] App store release notes prepared
- [ ] User notification planned (if breaking changes)
- [ ] Support team briefed on changes
- [ ] Documentation updated
- [ ] API changelog updated

## Final Checklist

### Go/No-Go Decision
- [ ] All critical checks passed
- [ ] Team consensus on readiness
- [ ] Rollback plan confirmed
- [ ] Monitoring in place
- [ ] Communication plan ready

### Deployment Approval
- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] QA lead approval
- [ ] Security review passed
- [ ] Final deployment authorized

---

## Deployment Commands Reference

### EAS Build & Submit

```bash
# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Local Testing

```bash
# Test production build locally
npx expo run:ios --configuration Release
npx expo run:android --variant release
```

### OTA Updates (if configured)

```bash
# Push OTA update
eas update --branch production --message "Bug fixes and improvements"
```

---

**Deployment Date:** ___________
**Deployed By:** ___________
**Version:** ___________
**Status:** [ ] Success [ ] Rolled Back

*Last Updated: 2025-08-14*