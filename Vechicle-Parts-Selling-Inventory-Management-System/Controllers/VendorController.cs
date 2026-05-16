using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class VendorController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var vendors = await _vendorService.GetAllAsync(search);
        return Ok(vendors);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var vendor = await _vendorService.GetByIdAsync(id);
        if (vendor == null)
            return NotFound($"Vendor with id {id} not found.");
        return Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVendorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var vendor = await _vendorService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVendorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var vendor = await _vendorService.UpdateAsync(id, dto);
        if (vendor == null)
            return NotFound($"Vendor with id {id} not found.");
        return Ok(vendor);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _vendorService.DeleteAsync(id);
        if (!result)
            return NotFound($"Vendor with id {id} not found.");
        return Ok("Vendor deleted successfully.");
    }
}
