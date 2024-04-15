import { Express, Request, Response } from "express";
import { ModelsProvider } from "../providers/models.provider";
import Joi from "joi";
import { asyncHandler } from "../utils/utils";
import { joiConfig } from "../utils/joi.config";

export class ModelsController {
  private constructor(private provider: ModelsProvider) {}

  public static init(app: Express, provider: ModelsProvider) {
    const controller = new ModelsController(provider);

    app.get("/api/models", asyncHandler(controller.getModels.bind(controller)));
    app.get("/api/models/:id", asyncHandler(controller.getModel.bind(controller)));
    app.post("/api/models", asyncHandler(controller.postModel.bind(controller)));
    app.put("/api/models/:id", asyncHandler(controller.putModel.bind(controller)));
    app.delete("/api/models/:id", asyncHandler(controller.deleteModel.bind(controller)));
  }

  private async getModels(_req: Request, res: Response) {
    return res.json(
      await this.provider.getAll()
    );
  }

  private async getModel(req: Request, res: Response) {
    const { id } = await Joi.object({
        id: Joi.string().max(255).required()
      })
      .validateAsync(req.params, joiConfig);

    const data = await this.provider.get(id);

    if (!data) {
      return res.status(404).json({
        message: `Model with id '${id}' not found`
      });
    } else {
      return res.json(data);
    }
  }

  private async postModel(req: Request, res: Response) {
    const values = await Joi.object({
        id: Joi.string().max(255).required(),
        name: Joi.string().max(255).required(),
        description: Joi.string().max(255).required(),
        context_length: Joi.number().required(),
        tokenizer: Joi.string().max(255).required(),
        modality: Joi.string().max(255).required()
      })
      .validateAsync(req.body, joiConfig);

    const postRes = await this.provider.create(values);

    if (postRes === 409) {
      return res.status(409).json({ message: `Model with id '${values.id}' already exist` });
    }

    return res.status(201).send();
  }

  private async putModel(req: Request, res: Response) {
    const { id } = await Joi.object({
        id: Joi.string().max(255).required()
      })
      .validateAsync(req.params, joiConfig);

    const values = await Joi.object({
        name: Joi.string().max(255),
        description: Joi.string().max(255),
        context_length: Joi.number(),
        tokenizer: Joi.string().max(255),
        modality: Joi.string().max(255)
      })
      .validateAsync(req.body, joiConfig);

    await this.provider.update(id, values);

    return res.status(200).send();
  }

  private async deleteModel(req: Request, res: Response) {
    const { id } = await Joi.object({
        id: Joi.string().max(255).required()
      })
      .validateAsync(req.params, joiConfig);

    await this.provider.delete(id);

    return res.status(200).send();
  }
}