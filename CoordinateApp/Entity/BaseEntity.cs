using System.ComponentModel.DataAnnotations;

namespace CoordinateApp.DataAccess
{
    public class BaseEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
    }
}
