using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Application.Exceptions;
using AuthService.Application.Extensions;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    IConfiguration configuration,
    ILogger<AuthService> logger) : IAuthService
{


    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {

        if (await userRepository.ExistsByEmailAsync(registerDto.Email))
        {
            logger.LogRegistrationWithExistingEmail();

            throw new BusinessException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                "Email already exists"
            );
        }


        if (await userRepository.ExistsByUsernameAsync(registerDto.Username))
        {
            logger.LogRegistrationWithExistingUsername();

            throw new BusinessException(
                ErrorCodes.USERNAME_ALREADY_EXISTS,
                "Username already exists"
            );
        }



        var userId = UuidGenerator.GenerateUserId();
        var userProfileId = UuidGenerator.GenerateUserId();
        var userRoleId = UuidGenerator.GenerateUserId();



        var defaultRole = await roleRepository.GetByNameAsync(
            RoleConstants.USER_ROLE
        );


        if (defaultRole == null)
        {
            throw new InvalidOperationException(
                $"Default role '{RoleConstants.USER_ROLE}' not found"
            );
        }



        var user = new User
        {
            Id = userId,

            Name = registerDto.Name,

            Surname = registerDto.Surname,

            Username = registerDto.Username,

            Email = registerDto.Email.ToLowerInvariant(),

            Password = passwordHashService.HashPassword(
                registerDto.Password
            ),

            Status = true,


            UserProfile = new UserProfile
            {
                Id = userProfileId,
                UserId = userId
            },


            UserRoles =
            [
                new Domain.Entities.UserRole
                {
                    Id = userRoleId,
                    UserId = userId,
                    RoleId = defaultRole.Id
                }
            ]
        };



        var createdUser = await userRepository.CreateAsync(user);


        logger.LogUserRegistered(createdUser.Username);



        return new RegisterResponseDto
        {
            Success = true,

            User = MapToUserResponseDto(createdUser),

            Message = "Usuario registrado exitosamente"
        };
    }




    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {

        User? user;


        if(loginDto.EmailOrUsername.Contains('@'))
        {
            user = await userRepository.GetByEmailAsync(
                loginDto.EmailOrUsername.ToLowerInvariant()
            );
        }
        else
        {
            user = await userRepository.GetByUsernameAsync(
                loginDto.EmailOrUsername
            );
        }



        if(user == null)
        {
            logger.LogFailedLoginAttempt();

            throw new UnauthorizedAccessException(
                "Invalid credentials"
            );
        }



        if(!passwordHashService.VerifyPassword(
            loginDto.Password,
            user.Password))
        {
            logger.LogFailedLoginAttempt();

            throw new UnauthorizedAccessException(
                "Invalid credentials"
            );
        }




        var token = jwtTokenService.GenerateToken(user);



        var expiryMinutes = int.Parse(
            configuration["JwtSettings:ExpiryInMinutes"] ?? "30"
        );



        return new AuthResponseDto
        {
            Success = true,

            Message = "Login exitoso",

            Token = token,

            UserDetails = MapToUserDetailsDto(user),

            ExpiresAt = DateTime.UtcNow.AddMinutes(
                expiryMinutes
            )
        };
    }





    private UserResponseDto MapToUserResponseDto(User user)
    {

        var role =
            user.UserRoles.FirstOrDefault()?.Role?.Name
            ?? RoleConstants.USER_ROLE;



        return new UserResponseDto
        {
            Id = user.Id,

            Name = user.Name,

            Surname = user.Surname,

            Username = user.Username,

            Email = user.Email,

            Role = role,

            Status = user.Status,

            CreatedAt = user.CreatedAt,

            UpdatedAt = user.UpdatedAt
        };
    }





    private UserDetailsDto MapToUserDetailsDto(User user)
    {
        return new UserDetailsDto
        {
            Id = user.Id,

            Username = user.Username,

            Role =
                user.UserRoles.FirstOrDefault()?.Role?.Name
                ?? RoleConstants.USER_ROLE
        };
    }





    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {

        var user = await userRepository.GetByIdAsync(userId);


        if(user == null)
            return null;


        return MapToUserResponseDto(user);
    }

}