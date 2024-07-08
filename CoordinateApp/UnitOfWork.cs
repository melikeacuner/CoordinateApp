using CoordinateApp.DataAccess;
using CoordinateApp.Repositories.Abstract;
using CoordinateApp.Repositories.Concrete;

namespace CoordinateApp
{
    public class UnitOfWork : IUnitOfWork
    {
        private CoordinateRepository _coordinateRepository;
        private readonly CoordinatesDbContext _context;
        
        public ICoordinateRepository CoordinateRepository => _coordinateRepository = _coordinateRepository ?? new CoordinateRepository(_context);

        public UnitOfWork(CoordinatesDbContext context)
        {
            _context = context;
        }
        public void Commit()
        {
            _context.SaveChanges() ;
        }
    }
}
