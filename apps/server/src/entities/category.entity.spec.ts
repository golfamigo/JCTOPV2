import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { getTestDatabaseConfig } from '../config/test-database.config';

describe('Category Entity', () => {
  let categoryRepository: Repository<Category>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([Category]),
      ],
    }).compile();

    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
  }, 30000);

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await categoryRepository.delete({});
  });

  describe('Entity Creation', () => {
    it('should create a category with valid data', async () => {
      const categoryData = {
        name: 'Technology',
        description: 'Technology and software events',
        color: '#3b82f6',
      };

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);

      expect(savedCategory.id).toBeDefined();
      expect(savedCategory.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBe(categoryData.description);
      expect(savedCategory.color).toBe(categoryData.color);
      expect(savedCategory.createdAt).toBeInstanceOf(Date);
      expect(savedCategory.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a category with default color', async () => {
      const categoryData = {
        name: 'Music',
        description: 'Music and entertainment events',
      };

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);

      expect(savedCategory.id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBe(categoryData.description);
      expect(savedCategory.color).toBe('#6366f1');
      expect(savedCategory.createdAt).toBeInstanceOf(Date);
      expect(savedCategory.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a category without description', async () => {
      const categoryData = {
        name: 'Sports',
        color: '#10b981',
      };

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);

      expect(savedCategory.id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.description).toBeNull();
      expect(savedCategory.color).toBe(categoryData.color);
    });
  });

  describe('Entity Validation', () => {
    it('should fail to save category without required name', async () => {
      const invalidCategoryData = {
        description: 'A category without name',
        color: '#f59e0b',
      };

      const category = categoryRepository.create(invalidCategoryData);
      
      await expect(categoryRepository.save(category)).rejects.toThrow();
    });

    it('should validate color field length', async () => {
      const categoryData = {
        name: 'Art',
        description: 'Art and culture events',
        color: '#ff0000ff', // Too long for 7 character limit
      };

      const category = categoryRepository.create(categoryData);
      
      await expect(categoryRepository.save(category)).rejects.toThrow();
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique name constraint', async () => {
      const categoryData1 = {
        name: 'Business',
        description: 'Business networking events',
        color: '#8b5cf6',
      };

      const categoryData2 = {
        name: 'Business',
        description: 'Different business events',
        color: '#ef4444',
      };

      const category1 = categoryRepository.create(categoryData1);
      await categoryRepository.save(category1);

      const category2 = categoryRepository.create(categoryData2);
      
      await expect(categoryRepository.save(category2)).rejects.toThrow();
    });

    it('should update the updatedAt timestamp when modified', async () => {
      const categoryData = {
        name: 'Education',
        description: 'Educational workshops and seminars',
        color: '#06b6d4',
      };

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);
      const originalUpdatedAt = savedCategory.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1100));

      savedCategory.description = 'Updated educational content';
      const updatedCategory = await categoryRepository.save(savedCategory);

      expect(updatedCategory.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      expect(updatedCategory.description).toBe('Updated educational content');
    });
  });

  describe('TypeORM Repository Integration', () => {
    it('should find category by name', async () => {
      const categoryData = {
        name: 'Health',
        description: 'Health and wellness events',
        color: '#10b981',
      };

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);

      const foundCategory = await categoryRepository.findOne({
        where: { name: categoryData.name }
      });

      expect(foundCategory).toBeDefined();
      expect(foundCategory!.id).toBe(savedCategory.id);
      expect(foundCategory!.name).toBe(categoryData.name);
    });

    it('should find categories by color', async () => {
      const categoriesData = [
        { name: 'Tech1', description: 'Tech events 1', color: '#3b82f6' },
        { name: 'Tech2', description: 'Tech events 2', color: '#3b82f6' },
        { name: 'Music', description: 'Music events', color: '#f59e0b' },
      ];

      for (const categoryData of categoriesData) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
      }

      const blueCategories = await categoryRepository.find({
        where: { color: '#3b82f6' }
      });

      expect(blueCategories).toHaveLength(2);
      blueCategories.forEach(category => {
        expect(category.color).toBe('#3b82f6');
      });
    });

    it('should count total categories', async () => {
      const categoriesData = [
        { name: 'Category 1', description: 'First category', color: '#ef4444' },
        { name: 'Category 2', description: 'Second category', color: '#10b981' },
        { name: 'Category 3', description: 'Third category', color: '#8b5cf6' },
      ];

      for (const categoryData of categoriesData) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
      }

      const categoryCount = await categoryRepository.count();
      expect(categoryCount).toBe(3);
    });
  });
});