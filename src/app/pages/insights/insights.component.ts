import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FinanceService } from '../../services/finance.service';
import { Insight } from '../../models';

interface InsightStyle {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [
    CurrencyPipe, PercentPipe,
    MatIconModule, MatButtonModule, MatProgressBarModule,
  ],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="insights-header">
        <div class="ai-badge">
          <mat-icon>auto_awesome</mat-icon>
          <span>IA Financeira</span>
        </div>
        <h2 class="page-title">Seus Insights</h2>
        <p class="page-sub">Análise personalizada dos seus gastos de junho</p>
      </div>

      <!-- Score card -->
      <div class="score-card">
        <div class="score-left">
          <p class="score-label">Saúde Financeira</p>
          <div class="score-value">{{ score }}<span class="score-max">/100</span></div>
          <p class="score-desc">{{ scoreDesc }}</p>
        </div>
        <div class="score-right">
          <div class="score-ring" [style.--progress]="score + '%'">
            <div class="score-inner">
              <mat-icon class="score-icon">{{ score >= 70 ? 'sentiment_satisfied' : 'sentiment_neutral' }}</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Spending breakdown mini -->
      <div class="breakdown-card">
        <p class="section-title">Distribuição dos gastos</p>
        @for (seg of finance.chartSegments(); track seg.category) {
          <div class="breakdown-row">
            <div class="br-label-row">
              <span class="br-dot" [style.background]="seg.color"></span>
              <span class="br-name">{{ seg.label }}</span>
              <span class="br-amount">{{ seg.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
              <span class="br-pct">{{ seg.percentage / 100 | percent:'1.0-0' }}</span>
            </div>
            <div class="br-bar-bg">
              <div class="br-bar-fill" [style.width.%]="seg.percentage" [style.background]="seg.color"></div>
            </div>
          </div>
        }
      </div>

      <!-- Insight cards -->
      <p class="section-title" style="padding: 0 16px; margin-bottom: 8px;">
        Dicas e alertas ({{ insights.length }})
      </p>

      <div class="insights-list">
        @for (insight of insights; track insight.id) {
          <div class="insight-card" [style.border-left-color]="getStyle(insight.type).border">
            <div class="insight-icon-wrap" [style.background]="getStyle(insight.type).iconBg">
              <mat-icon [style.color]="getStyle(insight.type).iconColor">{{ insight.icon }}</mat-icon>
            </div>
            <div class="insight-body">
              <div class="insight-top-row">
                <p class="insight-title">{{ insight.title }}</p>
                <span class="insight-badge"
                  [style.background]="getStyle(insight.type).badgeBg"
                  [style.color]="getStyle(insight.type).badgeText"
                >
                  {{ getStyle(insight.type).badgeLabel }}
                </span>
              </div>
              <p class="insight-desc">{{ insight.description }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="ai-footer">
        <mat-icon>auto_awesome</mat-icon>
        <p>Análise gerada pela IA FinSense em parceria com a Claro</p>
      </div>

    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: #F0F4F8;
      padding-bottom: 24px;
    }

    /* Header */
    .insights-header {
      background: linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #004D40 100%);
      padding: 24px 20px 32px;
      color: #fff;
    }
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .ai-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .page-title {
      font-size: 26px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      margin: 0 0 4px;
    }
    .page-sub {
      font-size: 13px;
      opacity: 0.70;
      margin: 0;
    }

    /* Score card */
    .score-card {
      background: #fff;
      border-radius: 20px;
      padding: 20px;
      margin: -16px 16px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    .score-left { flex: 1; }
    .score-label {
      font-size: 12px;
      color: #9CA3AF;
      margin: 0 0 4px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .score-value {
      font-size: 42px;
      font-weight: 800;
      font-family: 'Nunito', sans-serif;
      color: #1565C0;
      line-height: 1;
      margin-bottom: 6px;
    }
    .score-max {
      font-size: 18px;
      color: #9CA3AF;
      font-weight: 400;
    }
    .score-desc {
      font-size: 13px;
      color: #4B5563;
      margin: 0;
    }
    .score-right {
      margin-left: 20px;
    }
    .score-ring {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: conic-gradient(
        #1565C0 0% var(--progress),
        #E5E7EB var(--progress) 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-inner {
      width: 60px; height: 60px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-icon { color: #1565C0; font-size: 28px; width: 28px; height: 28px; }

    /* Breakdown */
    .breakdown-card {
      background: #fff;
      border-radius: 16px;
      padding: 18px;
      margin: 0 16px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1A1A2E;
      margin: 0 0 14px;
    }
    .breakdown-row {
      margin-bottom: 12px;
    }
    .br-label-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 5px;
    }
    .br-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .br-name {
      flex: 1;
      font-size: 12px;
      color: #4B5563;
    }
    .br-amount {
      font-size: 12px;
      font-weight: 600;
      color: #1A1A2E;
    }
    .br-pct {
      font-size: 11px;
      color: #9CA3AF;
      width: 36px;
      text-align: right;
    }
    .br-bar-bg {
      height: 6px;
      background: #F0F4F8;
      border-radius: 3px;
      overflow: hidden;
    }
    .br-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    /* Insight cards */
    .insights-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 0 16px;
    }
    .insight-card {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      gap: 12px;
      border-left: 4px solid;
      box-shadow: 0 1px 6px rgba(0,0,0,0.07);
    }
    .insight-icon-wrap {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .insight-icon-wrap mat-icon { font-size: 20px; }
    .insight-body { flex: 1; min-width: 0; }
    .insight-top-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }
    .insight-title {
      font-size: 13px;
      font-weight: 600;
      color: #1A1A2E;
      margin: 0;
      flex: 1;
    }
    .insight-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .insight-desc {
      font-size: 12px;
      color: #6B7280;
      line-height: 1.5;
      margin: 0;
    }

    /* Footer */
    .ai-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 20px 16px 0;
      padding: 12px 16px;
      background: #EFF6FF;
      border-radius: 10px;
    }
    .ai-footer mat-icon { color: #1565C0; font-size: 16px; }
    .ai-footer p {
      font-size: 11px;
      color: #6B7280;
      margin: 0;
    }
  `],
})
export class InsightsComponent {
  finance = inject(FinanceService);
  insights: Insight[] = this.finance.getInsights();

  score = 72;
  scoreDesc = 'Você está no caminho certo! Pequenos ajustes podem melhorar sua saúde financeira.';

  private styleMap: Record<string, InsightStyle> = {
    warning: {
      bg: '#FFFBEB',
      border: '#F59E0B',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#D97706',
      badgeLabel: 'Atenção',
    },
    tip: {
      bg: '#EFF6FF',
      border: '#3B82F6',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      badgeBg: '#DBEAFE',
      badgeText: '#2563EB',
      badgeLabel: 'Dica',
    },
    success: {
      bg: '#F0FDF4',
      border: '#22C55E',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      badgeBg: '#DCFCE7',
      badgeText: '#16A34A',
      badgeLabel: 'Meta',
    },
    info: {
      bg: '#F0F9FF',
      border: '#0EA5E9',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      badgeBg: '#E0F2FE',
      badgeText: '#0284C7',
      badgeLabel: 'Info',
    },
  };

  getStyle(type: string): InsightStyle {
    return this.styleMap[type] ?? this.styleMap['info'];
  }
}
