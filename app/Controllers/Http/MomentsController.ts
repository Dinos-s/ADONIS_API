import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { v4 as uuidv4 } from 'uuid'
import Moment from 'App/Models/Moment'
import Application from '@ioc:Adonis/Core/Application'

export default class MomentsController {
  private validationOptions = {
    //tamanho max da imagem na app
    types: ['image'],
    size: '2mb',
  }

  //Criando momento
  public async store({ request, response }: HttpContextContract) {
    const body = request.body() //resgatando o quem tem no body

    const image = request.file('image', this.validationOptions) //validando imagem

    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`
      await image.move(Application.tmpPath('uploads'), {
        name: imageName,
      }) //alocando imagem
      body.image = imageName
    }

    const moment = await Moment.create(body)

    response.status(201)

    return {
      message: 'momento criado',
      data: moment,
    }
  }

  // GET all
  public async index() {
    const moments = await Moment.query().preload('comments')
    return {
      data: moments,
    }
  }

  // GET por id
  public async show({ params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)
    await moment.load('comments')
    return {
      data: moment,
    }
  }

  //DELETE momento
  public async destroy({ params }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)
    await moment.delete()
    return {
      message: 'Momento Excluido',
      data: moment,
    }
  }

  //UPDATE momento
  public async update({ params, request }: HttpContextContract) {
    const body = request.body()
    const moment = await Moment.findOrFail(params.id)

    //dados a serem atualizados
    moment.title = body.title
    moment.description = body.description

    if (moment.image !== body.image || !moment.image) {
      const image = request.file('image', this.validationOptions)
      if (image) {
        const imageName = `${uuidv4()}.${image.extname}`
        await image.move(Application.tmpPath('uploads'), {
          name: imageName,
        })
        body.image = imageName
      }
    }
    await moment.save()

    return {
      message: 'momento atualizado',
      data: moment,
    }
  }
}
