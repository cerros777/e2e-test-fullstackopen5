const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createNewBlog} = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    // ...
    const locator = await page.getByText('Log in to application')
    await expect(locator).toBeVisible()
  })

describe('Login', () => {
  beforeEach(async ({page, request}) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        username: 'testuser',
        name: 'test',
        password: '1234'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('succeeds with correct credentials', async ({page}) => {
    await loginWith(page, 'testuser', '1234')
    await expect(page.getByText('test logged in')).toBeVisible()
  })

  test('fails with wrong credentials', async({page}) => {
    await loginWith(page, 'testuser', 'wrong')
    await expect(page.getByText('Wrong credentials')).toBeVisible()
    await expect(page.getByText('test is logged in')).not.toBeVisible()
  })
})

describe('when logged in', () => {
  beforeEach(async ({page}) => {
    await loginWith(page, 'testuser', '1234')
  })

  test('a new blog can be created', async ({page}) => {
    await createNewBlog(page, 'first blog')
    await expect(page.getByText('first blog')).toBeVisible()
  })

  test('user likes blog', async({page}) => {
    await createNewBlog(page, 'liked blog')
    const blog = await page.getByText('liked blog').locator('..')

    await blog.getByRole('button', {name: 'view'}).click()
    

    // Click the 'like' button to like the blog
    await blog.getByRole('button', { name: 'like' }).click();
  })

  test('create and delete blog', async({page}) =>{
    
    await createNewBlog(page, 'delete this blog')
    const blog = await page.getByText('delete this blog').locator('..')
    await blog.getByRole('button', {name: 'view'}).click()
    await page.waitForSelector('button[name="remove"]', { state: 'visible', timeout: 10000 });

    await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()
    
    await page.getByRole('button', { name: 'remove' }).click()
    page.on('dialog', async (dialog)=> {
      expect(dialog.type()).toBe('confirm')
      await dialog.accept()
    })
    // Assert blog deletion
    await expect(page.getByText('delete this blog')).not.toBeVisible(); 
  })
})
})