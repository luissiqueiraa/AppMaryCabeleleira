import { jest } from "@jest/globals";

const categoriesRepository = {
  findAllCategories: jest.fn(),
  findCategoryById: jest.fn(),
  findCategoryByNameOrSlug: jest.fn(),
  findCategoriesBySlugPrefix: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  softDeleteCategory: jest.fn(),
  countServicesInCategory: jest.fn(),
};

jest.unstable_mockModule("../../src/repositories/serviceCategories.repository.js", () => categoriesRepository);
jest.unstable_mockModule("../../src/utils/auditLogger.js", () => ({ recordAuditLog: jest.fn() }));

const {
  slugify,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  assertCategoryExists,
} = await import("../../src/services/serviceCategories.service.js");

const req = { user: { id: "admin-1" } };

function categoria(overrides = {}) {
  return {
    id: "cat-1",
    name: "Cabelo",
    slug: "hair",
    icon: "scissors",
    sortOrder: 1,
    active: true,
    deletedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  categoriesRepository.findCategoriesBySlugPrefix.mockResolvedValue([]);
  categoriesRepository.findCategoryByNameOrSlug.mockResolvedValue(null);
  categoriesRepository.createCategory.mockImplementation((data) => categoria({ id: "cat-novo", ...data }));
  categoriesRepository.updateCategory.mockImplementation((id, data) => categoria({ id, ...data }));
  categoriesRepository.countServicesInCategory.mockResolvedValue(0);
});

describe("slug da categoria", () => {
  it.each([
    ["Depilação", "depilacao"],
    ["Cabelo e Barba", "cabelo-e-barba"],
    ["  Unhas  ", "unhas"],
    ["MAQUIAGEM", "maquiagem"],
    ["Pés & Mãos", "pes-maos"],
    ["Sobrancelha / Design", "sobrancelha-design"],
  ])("%s vira %s", (nome, esperado) => {
    expect(slugify(nome)).toBe(esperado);
  });

  it("nome só com símbolos não gera slug vazio", async () => {
    // Slug vazio quebraria o índice único na segunda categoria do tipo.
    expect(slugify("###")).toBe("");
    const dto = await createCategory({ name: "###" }, req);
    expect(dto.slug).toBe("categoria");
  });

  it("slugs iguais de nomes diferentes são numerados", async () => {
    categoriesRepository.findCategoriesBySlugPrefix.mockResolvedValue([{ slug: "pes" }, { slug: "pes-2" }]);

    const dto = await createCategory({ name: "PÉS" }, req);

    expect(dto.slug).toBe("pes-3");
  });
});

describe("criar categoria", () => {
  it("cria com o slug derivado do nome", async () => {
    const dto = await createCategory({ name: "Depilação" }, req);

    expect(categoriesRepository.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Depilação", slug: "depilacao" })
    );
    expect(dto.name).toBe("Depilação");
  });

  it("recusa nome que já existe", async () => {
    categoriesRepository.findCategoryByNameOrSlug.mockResolvedValue(categoria());

    await expect(createCategory({ name: "Cabelo" }, req)).rejects.toMatchObject({ statusCode: 409 });
    expect(categoriesRepository.createCategory).not.toHaveBeenCalled();
  });

  // O nome é único no banco inteiro, inclusive nas excluídas: criar outra com
  // o mesmo nome bateria no índice único, então a antiga é reativada.
  it("recria uma categoria excluída reativando a antiga", async () => {
    categoriesRepository.findCategoryByNameOrSlug.mockResolvedValue(
      categoria({ deletedAt: new Date("2026-01-01"), active: false })
    );

    const dto = await createCategory({ name: "Cabelo" }, req);

    expect(categoriesRepository.createCategory).not.toHaveBeenCalled();
    expect(categoriesRepository.updateCategory).toHaveBeenCalledWith(
      "cat-1",
      expect.objectContaining({ deletedAt: null, active: true })
    );
    expect(dto.id).toBe("cat-1");
  });
});

describe("ícone da categoria", () => {
  it("guarda o ícone escolhido na criação", async () => {
    const dto = await createCategory({ name: "Depilação", icon: "feather" }, req);

    expect(categoriesRepository.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "feather" })
    );
    expect(dto.icon).toBe("feather");
  });

  it("sem ícone escolhido não grava o campo (o padrão fica com a vitrine)", async () => {
    await createCategory({ name: "Depilação" }, req);

    expect(categoriesRepository.createCategory.mock.calls[0][0]).not.toHaveProperty("icon");
  });

  it("troca só o ícone, sem mexer no nome", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());

    await updateCategory("cat-1", { icon: "star" }, req);

    expect(categoriesRepository.updateCategory).toHaveBeenCalledWith("cat-1", { icon: "star" });
  });

  it("o ícone vai no DTO para a tela escolher o desenho", async () => {
    categoriesRepository.findAllCategories.mockResolvedValue([categoria({ icon: "zap" })]);

    const [dto] = await listCategories([]);

    expect(dto.icon).toBe("zap");
  });
});

describe("renomear categoria", () => {
  it("mantém o slug ao renomear", async () => {
    // O slug é o identificador estável: o frontend escolhe o ícone por ele, e
    // mudá-lo numa renomeação trocaria o ícone sem aviso.
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());

    await updateCategory("cat-1", { name: "Cabelos" }, req);

    expect(categoriesRepository.updateCategory).toHaveBeenCalledWith("cat-1", { name: "Cabelos" });
    expect(categoriesRepository.updateCategory.mock.calls[0][1]).not.toHaveProperty("slug");
  });

  it("recusa renomear para um nome já usado", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());
    categoriesRepository.findCategoryByNameOrSlug.mockResolvedValue(categoria({ id: "cat-2", name: "Unhas" }));

    await expect(updateCategory("cat-1", { name: "Unhas" }, req)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("categoria inexistente dá 404", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(null);

    await expect(updateCategory("nao-existe", { name: "X" }, req)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("excluir categoria", () => {
  it("recusa excluir categoria com serviços dentro", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());
    categoriesRepository.countServicesInCategory.mockResolvedValue(3);

    await expect(deleteCategory("cat-1", req)).rejects.toMatchObject({ statusCode: 409 });
    expect(categoriesRepository.softDeleteCategory).not.toHaveBeenCalled();
  });

  it("exclui categoria vazia", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());

    await deleteCategory("cat-1", req);

    expect(categoriesRepository.softDeleteCategory).toHaveBeenCalledWith("cat-1");
  });

  it("serviço excluído não impede apagar a categoria", async () => {
    // countServicesInCategory só conta serviço vivo (deletedAt null).
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());
    categoriesRepository.countServicesInCategory.mockResolvedValue(0);

    await deleteCategory("cat-1", req);

    expect(categoriesRepository.softDeleteCategory).toHaveBeenCalled();
  });
});

describe("listar categorias", () => {
  it("quem administra vê as inativas também", async () => {
    categoriesRepository.findAllCategories.mockResolvedValue([categoria()]);

    await listCategories(["manage_services"]);

    expect(categoriesRepository.findAllCategories).toHaveBeenCalledWith({ activeOnly: false });
  });

  it("cliente vê apenas as ativas", async () => {
    categoriesRepository.findAllCategories.mockResolvedValue([categoria()]);

    await listCategories([]);

    expect(categoriesRepository.findAllCategories).toHaveBeenCalledWith({ activeOnly: true });
  });
});

describe("categoria usada no cadastro de serviço", () => {
  it("categoria inexistente recusa o serviço com 422", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(null);

    await expect(assertCategoryExists("cat-fantasma")).rejects.toMatchObject({ statusCode: 422 });
  });

  it("categoria existente passa", async () => {
    categoriesRepository.findCategoryById.mockResolvedValue(categoria());

    await expect(assertCategoryExists("cat-1")).resolves.toMatchObject({ id: "cat-1" });
  });
});
