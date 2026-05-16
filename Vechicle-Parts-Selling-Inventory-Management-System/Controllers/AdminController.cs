using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database.Entities;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<Users> _userManager;

    public AdminController(UserManager<Users> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetAllStaff()
    {
        var staff = await _userManager.GetUsersInRoleAsync("Staff");
        var staffList = staff.Select(u => new
        {
            u.Id,
            u.FirstName,
            u.LastName,
            u.Email,
            u.UserName
        });
        return Ok(staffList);
    }

    [HttpGet("staff/{id}")]
    public async Task<IActionResult> GetStaffById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound($"Staff with id {id} not found.");

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            Roles = roles
        });
    }

    [HttpDelete("staff/{id}")]
    public async Task<IActionResult> DeleteStaff(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound($"Staff with id {id} not found.");

        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains("Staff"))
            return BadRequest("User is not a staff member.");

        var result = await _userManager.DeleteAsync(user);
        if (result.Succeeded)
            return Ok("Staff deleted successfully.");

        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return BadRequest(errors);
    }
}
