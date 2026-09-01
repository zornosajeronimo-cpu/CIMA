// ============================================================
// Permission Engine — evaluates risk before any AI action runs
// PRINCIPLE: The AI proposes. CIMA decides.
// ============================================================

import type { RiskLevel } from '@/models/actionPlan';
import type { AIActionProposal } from '@/models/aiResponse';
import { ToolRegistry } from '@/core/tools/registry';

export interface PermissionPolicy {
  /** Read actions execute automatically */
  autoApproveRead: boolean;
  /** Write actions that modify data */
  autoApproveWrite: boolean;
  /** Destructive actions (delete, archive) always require confirmation */
  autoApproveDestructive: boolean;
  /** External actions (send email, WhatsApp, etc.) always require confirmation */
  autoApproveExternal: boolean;
}

export const DEFAULT_POLICY: PermissionPolicy = {
  autoApproveRead: true,
  autoApproveWrite: true,       // writes execute automatically — user can always undo via audit
  autoApproveDestructive: false, // DELETE operations require explicit confirmation
  autoApproveExternal: false,    // external calls require explicit confirmation
};

export interface PermissionResult {
  canExecute: boolean;
  requiresConfirmation: boolean;
  reason: string;
  risk: RiskLevel;
}

export class PermissionEngine {
  constructor(private policy: PermissionPolicy = DEFAULT_POLICY) {}

  evaluate(proposal: AIActionProposal): PermissionResult {
    // Check tool exists in registry
    const tool = ToolRegistry.get(proposal.tool);
    if (!tool) {
      return {
        canExecute: false,
        requiresConfirmation: false,
        reason: `Tool "${proposal.tool}" is not registered in CIMA.`,
        risk: 'read',
      };
    }

    const risk = tool.risk;

    switch (risk) {
      case 'read':
        return {
          canExecute: true,
          requiresConfirmation: false,
          reason: 'Read operation — auto-approved.',
          risk,
        };
      case 'write':
        return {
          canExecute: true,
          requiresConfirmation: !this.policy.autoApproveWrite,
          reason: this.policy.autoApproveWrite
            ? 'Write operation — auto-approved by policy.'
            : 'Write operation — requires confirmation.',
          risk,
        };
      case 'destructive':
        return {
          canExecute: !this.policy.autoApproveDestructive || true, // can execute after confirmation
          requiresConfirmation: !this.policy.autoApproveDestructive,
          reason: 'Destructive operation — confirmation required.',
          risk,
        };
      case 'external':
        return {
          canExecute: !this.policy.autoApproveExternal || true,
          requiresConfirmation: !this.policy.autoApproveExternal,
          reason: 'External operation — confirmation required. No external APIs are connected yet.',
          risk,
        };
    }
  }

  evaluatePlan(proposals: AIActionProposal[]): { requiresConfirmation: boolean; results: PermissionResult[] } {
    const results = proposals.map(p => this.evaluate(p));
    const requiresConfirmation = results.some(r => r.requiresConfirmation);
    return { requiresConfirmation, results };
  }
}

export const permissionEngine = new PermissionEngine(DEFAULT_POLICY);
