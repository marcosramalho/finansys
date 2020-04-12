import { InMemoryDbService } from 'angular-in-memory-web-api'
import { Category } from './pages/categories/shared/category.model'
import { Entry } from './pages/entries/shared/entry.model'

export class InMemoryDatabase implements InMemoryDatabase {
  
  createDb() {
    const categories: Category[] = [      
      { id: 1, name: "Moradia", description: 'pagamentos de Contas da Casa', },
      { id: 2, name: "Saúde", description: 'Plano de Saúde e Remédios', },
      { id: 3, name: "Lazer", description: 'Cinema, parques, praia, etc', },
      { id: 4, name: "Salário", description: 'Recimento de Salário', },
      { id: 5, name: "Freelas", description: 'Trabalhos como freelancer', },
    ]

    const entries: Entry[] = [
      { id: 1, name: "Gás de Cozinha", categoryId: categories[0].id, category: categories[0], paid: false, date: "14/10/2018", amount: "70,80", type: "expense", description: "Gás de cozinha" } as Entry,
      { id: 2, name: "Suplementos", categoryId: categories[2].id, category: categories[2], paid: false, date: "30/10/2018", amount: "120,80", type: "expense", description: "Suplementos caiçara" } as Entry,
      { id: 3, name: "Salário na empresa X", categoryId: categories[4].id, category: categories[4], paid: true, date: "01/03/2020", amount: "1070,80", type: "revenue", description: "Parcela 48/60 da empresa" } as Entry,
      { id: 4, name: "Cinema", categoryId: categories[3].id, category: categories[3], paid: true, date: "05/04/2020", amount: "50,00", type: "expense", description: "Diversão do filme arquivo X" } as Entry,
      { id: 5, name: "Uber", categoryId: categories[1].id, category: categories[1], paid: true, date: "20/07/2019", amount: "10,00", type: "expense", description: "Carro na volta para casa" } as Entry,
      
    ]

    return { categories, entries }
  }
}