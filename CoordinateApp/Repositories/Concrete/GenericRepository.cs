using CoordinateApp.Entity;
using CoordinateApp.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace CoordinateApp.Repositories.Concrete;

public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
{
    private readonly DbContext _context;
    protected DbSet<T> _dbSet => _context.Set<T>();
    public GenericRepository(DbContext context)
    {
        _context = context;
    }
    public bool Add(T entity)
    {
        if (entity == null)
        {
            return false;
        }

        _dbSet.Add(entity);

        return true;
    }

    public bool Delete(Guid id)
    {
        var entityToBeDeleted = _dbSet.FirstOrDefault(x => x.Id == id);
        if (entityToBeDeleted == null)
        {
            return false;
        }

        _dbSet.Remove(entityToBeDeleted);

        return true;
    }

    public List<T> GetAll()
    {
        return _dbSet.ToList();
    }

    public T? GetById(Guid id)
    {
        return _dbSet.FirstOrDefault(x => x.Id == id);
    }

    public bool Update(T entity)
    {
        if (entity == null)
        {
            return false;
        }

        var entityToBeUpdated = _dbSet.FirstOrDefault(x => x.Id == entity.Id);

        if (entityToBeUpdated == null)
        {
            return false;
        }

        _dbSet.Entry(entityToBeUpdated).CurrentValues.SetValues(entity);

        return true;
    }
}
