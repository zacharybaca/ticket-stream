import asyncHandler from "express-async-handler";
import Company from "../models/Company.js";
import User from "../models/User.js";

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: List companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Companies returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({}).sort({ name: 1 });
  res.json(companies);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company identifier.
 *     responses:
 *       200:
 *         description: Company returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  res.json(company);
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company
 *     tags: [Companies]
 *     parameters:
  *       - in: header
  *         name: X-CSRF-Token
  *         schema:
  *           type: string
  *         required: true
  *         description: Required for authenticated unsafe requests (must match the csrfToken cookie).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - domain
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *                 example: example.com
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Invalid company data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const createCompany = asyncHandler(async (req, res) => {
  const { name, domain, description, industry, website } = req.body;

  const exists = await Company.findOne({ domain: domain?.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("A company with that domain already exists");
  }

  const company = await Company.create({
    name,
    domain,
    description,
    industry,
    website,
  });

  res.status(201).json(company);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company identifier.
  *       - in: header
  *         name: X-CSRF-Token
  *         schema:
  *           type: string
  *         required: true
  *         description: Required for authenticated unsafe requests (must match the csrfToken cookie).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               domain:
 *                 type: string
 *                 example: example.com
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Invalid company data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  if (req.body.domain && req.body.domain.toLowerCase() !== company.domain) {
    const conflict = await Company.findOne({
      domain: req.body.domain.toLowerCase(),
    });
    if (conflict) {
      res.status(400);
      throw new Error("A company with that domain already exists");
    }
  }

  company.name = req.body.name || company.name;
  company.domain = req.body.domain
    ? req.body.domain.toLowerCase()
    : company.domain;
  company.description = req.body.description ?? company.description;
  company.industry = req.body.industry ?? company.industry;
  company.website = req.body.website ?? company.website;

  const updated = await company.save();
  res.json(updated);
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company identifier.
 *       - in: header
 *         name: X-CSRF-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Required when a valid jwt cookie is present on the request.
 *     responses:
 *       200:
 *         description: Company deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Company cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  const userCount = await User.countDocuments({ company: company._id });
  if (userCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete company: ${userCount} user(s) are still associated with it.`,
    );
  }

  await company.deleteOne();
  res.json({ message: "Company removed" });
});

export {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
