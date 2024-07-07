﻿using System.ComponentModel.DataAnnotations;

namespace CoordinateApp.Entity
{
    public class BaseEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
    }
}
