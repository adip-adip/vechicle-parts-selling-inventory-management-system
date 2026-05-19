using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vechicle_Parts_Selling_Inventory_Management_System.DTOS;
using Vechicle_Parts_Selling_Inventory_Management_System.Service.Interface;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class PartsController : ControllerBase
{
    private readonly IPartService _partService;

    public PartsController(IPartService partService)
    {
        _partService = partService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var parts = await _partService.GetAllAsync();
        return Ok(parts);
    }

    // Dashboard: returns all parts with StockQuantity < 10, ordered by quantity ascending
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var parts = await _partService.GetLowStockAsync();
        return Ok(parts);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var part = await _partService.GetByIdAsync(id);
        if (part == null)
            return NotFound($"Part with id {id} not found.");
        return Ok(part);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePartDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var part = await _partService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = part.Id }, part);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePartDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var part = await _partService.UpdateAsync(id, dto);
        if (part == null)
            return NotFound($"Part with id {id} not found.");
        return Ok(part);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _partService.DeleteAsync(id);
        if (!result)
            return NotFound($"Part with id {id} not found.");
        return Ok("Part deleted successfully.");
    }
}
