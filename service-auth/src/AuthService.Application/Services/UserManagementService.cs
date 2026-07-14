using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(
    IUserRepository users,
    IRoleRepository roles
) : IUserManagementService
{

    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Invalid userId", nameof(userId));

        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException(
                $"Role not allowed. Use {RoleConstants.ADMIN_ROLE} or {RoleConstants.USER_ROLE}"
            );


        var user = await users.GetByIdAsync(userId);

        if (user == null)
            throw new InvalidOperationException("User not found");


        var isUserAdmin = user.UserRoles
            .Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);


        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
                throw new InvalidOperationException(
                    "Cannot remove the last administrator"
                );
        }


        var role = await roles.GetByNameAsync(roleName)
            ?? throw new InvalidOperationException(
                $"Role {roleName} not found"
            );


        await users.UpdateUserRoleAsync(userId, role.Id);


        user = await users.GetByIdAsync(userId);


        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            Role = role.Name,
            Status = user.Status,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }



    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);

        return roleNames;
    }



    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;


        var usersInRole = await roles.GetUsersByRoleAsync(roleName);


        return usersInRole.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Surname = u.Surname,
            Username = u.Username,
            Email = u.Email,
            Role = roleName,
            Status = u.Status,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt

        }).ToList();
    }
}