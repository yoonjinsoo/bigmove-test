const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

;(async () => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: 'yoonjinsoo17@gmail.com'
      },
      data: {
        role: 'ADMIN'
      }
    })
    console.log('사용자 권한 업데이트 완료:', updatedUser)
  } catch (error) {
    console.error('에러 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
})() 