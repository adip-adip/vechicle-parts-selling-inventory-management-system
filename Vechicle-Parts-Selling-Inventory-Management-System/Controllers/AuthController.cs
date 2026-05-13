using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<Users> _userManager;

    public AuthController(IAuthService authService, UserManager<Users> userManager)
    {
        _authService = authService;
        _userManager = userManager;
    }

    [HttpPost("register-admin")]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAdminAsync(dto);
        if (result.Success)
            return Ok(new { message = result.Message, userId = result.UserId });

        return BadRequest(new { message = result.Message });
    }

    [HttpPost("register-staff")]
    public async Task<IActionResult> RegisterStaff([FromBody] RegisterStaffDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterStaffAsync(dto);
        if (result.Success)
            return Ok(new { message = result.Message, userId = result.UserId });

        return BadRequest(new { message = result.Message });
    }

    [HttpPost("register-customer")]
    public async Task<IActionResult> RegisterCustomer([FromBody] RegisterCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterCustomerAsync(dto);
        if (result.Success)
            return Ok(new { message = result.Message, userId = result.UserId });

        return BadRequest(new { message = result.Message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(dto);
        if (result.Success)
            return Ok(result);

        return Unauthorized(new { message = result.Message });
    }

    [HttpPost("profile/upload")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (!file.ContentType.StartsWith("image/"))
            return BadRequest("Only image files are allowed.");

        var userId = _userManager.GetUserId(User);
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        user.ProfilePicture = memoryStream.ToArray();
        user.ProfilePictureContentType = file.ContentType;

        var result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
            return Ok(new { message = "Profile picture uploaded successfully." });

        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return BadRequest(errors);
    }

    [HttpGet("profile/download")]
    [Authorize]
    public async Task<IActionResult> DownloadProfilePicture()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || user.ProfilePicture == null || user.ProfilePicture.Length == 0)
            return NotFound("No profile picture found.");

        return File(user.ProfilePicture, user.ProfilePictureContentType ?? "image/jpeg");
    }
}
