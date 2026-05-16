# Step 3: Backend Implementation Checklist (Advanced RBAC)

```markdown
[ ] 1. Shared Contracts (Zod tại shared/contracts/rbac.ts)
[ ] 2. Database Schema (Cập nhật lib/db/src/schema/auth.ts)
[ ] 3. Run migration (quick-fix hoặc drizzle-kit generate)
[ ] 4. Domain Entities: PermissionGroup, RoleTemplate
[ ] 5. Repository Interfaces (IPermissionGroupRepository, IRoleTemplateRepository)
[ ] 6. Mappers: PermissionGroupMapper, RoleTemplateMapper
[ ] 7. Repository Implementations (Drizzle...)
[ ] 8. Application Service: RbacService (getGroups, getTemplates, getRoleMembers, etc.)
[ ] 9. Request/Response DTOs
[ ] 10. Controller: Cập nhật RbacManagement.controller.ts với các endpoint mới
[ ] 11. Module Wiring: Cập nhật AdminModule
[ ] 12. Unit Test cho RbacService
[ ] 13. Integration Test cho Repositories
[ ] 14. npm run build check
```

Bạn đã sẵn sàng để tôi bắt đầu viết CODE Backend chưa?
