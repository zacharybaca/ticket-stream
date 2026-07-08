import asyncHandler from "express-async-handler";
import Company from "../models/Company.js";

/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Private/Admin
 */
const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({}).sort({ name: 1 });
  res.json(companies);
});

/**
 * @desc    Get a single company by ID
 * @route   GET /api/companies/:id
 * @access  Private/Admin
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
 * @desc    Create a company
 * @route   POST /api/companies
 * @access  Private/Admin
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
 * @desc    Update a company
 * @route   PUT /api/companies/:id
 * @access  Private/Admin
 */
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  company.name = req.body.name ?? company.name;
  company.domain = req.body.domain ?? company.domain;
  company.description = req.body.description ?? company.description;
  company.industry = req.body.industry ?? company.industry;
  company.website = req.body.website ?? company.website;

  const updated = await company.save();
  res.json(updated);
});

/**
 * @desc    Delete a company
 * @route   DELETE /api/companies/:id
 * @access  Private/Admin
 */
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
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
