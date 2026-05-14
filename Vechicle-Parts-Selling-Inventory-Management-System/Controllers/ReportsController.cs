using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vechicle_Parts_Selling_Inventory_Management_System.Database;

namespace Vechicle_Parts_Selling_Inventory_Management_System.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ReportsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("daily")]
    public async Task<IActionResult> DailyReport([FromQuery] DateTime? date)
    {
        var reportDate = date?.Date ?? DateTime.UtcNow.Date;
        var nextDate = reportDate.AddDays(1);

        var sales = await _dbContext.Sales
            .Where(s => s.SaleDate >= reportDate && s.SaleDate < nextDate)
            .ToListAsync();

        return Ok(new
        {
            Date = reportDate.ToString("yyyy-MM-dd"),
            TotalSales = sales.Sum(s => s.TotalAmount),
            TransactionCount = sales.Count,
            Sales = sales
        });
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> MonthlyReport([FromQuery] int? year, [FromQuery] int? month)
    {
        var reportYear = year ?? DateTime.UtcNow.Year;
        var reportMonth = month ?? DateTime.UtcNow.Month;

        var sales = await _dbContext.Sales
            .Where(s => s.SaleDate.Year == reportYear && s.SaleDate.Month == reportMonth)
            .ToListAsync();

        var dailyBreakdown = sales
            .GroupBy(s => s.SaleDate.Date)
            .Select(g => new
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                TotalSales = g.Sum(s => s.TotalAmount),
                TransactionCount = g.Count()
            })
            .OrderBy(g => g.Date)
            .ToList();

        return Ok(new
        {
            Year = reportYear,
            Month = reportMonth,
            TotalSales = sales.Sum(s => s.TotalAmount),
            TransactionCount = sales.Count,
            DailyBreakdown = dailyBreakdown
        });
    }

    [HttpGet("yearly")]
    public async Task<IActionResult> YearlyReport([FromQuery] int? year)
    {
        var reportYear = year ?? DateTime.UtcNow.Year;

        var sales = await _dbContext.Sales
            .Where(s => s.SaleDate.Year == reportYear)
            .ToListAsync();

        var monthlyBreakdown = sales
            .GroupBy(s => s.SaleDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                MonthName = new DateTime(reportYear, g.Key, 1).ToString("MMMM"),
                TotalSales = g.Sum(s => s.TotalAmount),
                TransactionCount = g.Count()
            })
            .OrderBy(g => g.Month)
            .ToList();

        return Ok(new
        {
            Year = reportYear,
            TotalSales = sales.Sum(s => s.TotalAmount),
            TransactionCount = sales.Count,
            MonthlyBreakdown = monthlyBreakdown
        });
    }
}
