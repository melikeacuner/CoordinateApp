
using CoordinateApp.Entity;

namespace CoordinateApp.Models;

public class Coordinate : BaseEntity
{
    public int X { get; set; }
    public int Y { get; set; }
    public string Name { get; set; }
}
