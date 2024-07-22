using CoordinateApp.Context;
using CoordinateApp.Repositories.Abstract;
using CoordinateApp.Repositories.Concrete;
using Microsoft.EntityFrameworkCore;

namespace CoordinateApp
{
    public class UnitOfWork : IUnitOfWork
    {
        private CoordinateRepository _coordinateRepository;
        private readonly CoordinateDbContext _context;
        public UnitOfWork(CoordinateDbContext context)
        {
            _context = context;
        }
        
        public ICoordinateRepository CoordinateRepository => _coordinateRepository = _coordinateRepository ?? new CoordinateRepository(_context);

        public int Commit()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
