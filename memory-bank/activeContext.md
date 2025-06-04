# Active Development Context

## Current Focus
- Parallel development of web and native app versions
- Optimizing project structure and size
- Maintaining cross-platform compatibility

## Recent Changes
- Removed Docker and Supabase CLI implementations
- Cleaned up unnecessary files and dependencies
- Preserved web-specific components and functionality

## Next Steps
- Continue enhancing both web and native features
- Ensure optimal performance across platforms
- Maintain clean and efficient codebase

## Active Decisions
- Using Supabase dashboard for database management instead of CLI
- Keeping web-specific code for parallel development
- Focusing on cross-platform compatibility in all new features

## Current Focus
- Role-based authentication implementation
- Shared component architecture
- State management setup
- Platform detection utilities
- Basic UI components
- Development environment setup

## Recent Changes
- Initialized project structure
- Set up core dependencies
- Configured Supabase client
- Created platform detection utilities
- Established type definitions
- Initialized version control
- Created branch structure (stable/v1.0.0, develop/v1.0.0)

## Next Steps

### Immediate Tasks
1. Set up authentication system
   - Implement role-based auth flow
   - Create auth screens
   - Set up RLS policies
   - Add biometric auth

2. Create shared components
   - Form components
   - Navigation components
   - Map components
   - QR code components
   - Loading states
   - Error boundaries

3. Set up state management
   - Configure Zustand stores
   - Set up React Query
   - Implement offline support
   - Add real-time subscriptions

### Short-term Goals
- Implement role-specific flows
- Set up QR code system
- Create tracking interface
- Implement map integration
- Set up payment system
- Add platform-specific features

### Medium-term Goals
- Implement real-time features
- Add multilingual support
- Optimize performance
- Enhance security
- Improve user experience
- Ensure cross-platform consistency

## Active Decisions

### Architecture Decisions
- Using shared business logic
- Implementing platform-specific UI
- Using Zustand for state management
- Implementing OpenStreetMap
- Using role-based routing
- Implementing platform detection

### Technical Decisions
- TypeScript for type safety
- React Query for data fetching
- React Hook Form for forms
- Yup for validation
- Platform-specific navigation
- Shared API layer

## Current Considerations

### Performance
- Optimizing map loading
- Implementing efficient QR scanning
- Setting up offline capabilities
- Optimizing image uploads
- Managing real-time updates
- Cross-platform optimization

### Security
- Implementing role-based access
- Setting up RLS policies
- Configuring secure payments
- Implementing biometric auth
- Setting up monitoring
- Platform-specific security

### User Experience
- Designing role-specific flows
- Implementing multilingual UI
- Creating intuitive navigation
- Optimizing loading states
- Implementing error handling 
- Ensuring platform consistency 