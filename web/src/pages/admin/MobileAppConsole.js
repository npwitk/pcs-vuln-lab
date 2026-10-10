import React, { lazy, Suspense, useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import usePageMeta from '../../hooks/usePageMeta';
import Breadcrumbs from '../../components/ui/Breadcrumb';

const RevenueChart = lazy(() => import('../../components/admin/RevenueChart'));

// Admin console for the iOS app: who uses it (server/services/appUsage.js)
// and what it has earned. The app's only paid product is coin packs, sold
// through the App Store via RevenueCat (routes/wallet.js webhook).

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin: 1rem 0 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2rem;
  max-width: 720px;
`;

const GroupLabel = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 0.25rem;
`;

const GroupNote = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 1rem;
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

const Tile = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.1rem 1.25rem;
`;

const TileLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.35rem;
`;

const TileValue = styled.div`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => (props.$accent ? props.theme.colors.primary : props.theme.colors.text)};
  font-variant-numeric: tabular-nums;
`;

const TileSub = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const Panel = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.25rem;
  margin-bottom: 2.5rem;
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.theme.typography.sizes.sm};

  th, td {
    padding: 0.7rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
    white-space: nowrap;
  }

  th {
    color: ${props => props.theme.colors.textSecondary};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }

  td.num, th.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Person = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const Muted = styled.span`
  color: ${props => props.theme.colors.textSecondary};
`;

const Empty = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const baht = (value) => `฿${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const count = (value) => Number(value || 0).toLocaleString('en-US');

function timeAgo(value) {
  if (!value) return '—';
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 60) return 'within the hour';
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const formatDate = (value) => (value
  ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—');

export default function MobileAppConsole() {
  usePageMeta('Mobile App');
  const [data, setData] = useState(null);

  useEffect(() => {
    adminAPI.getMobileAppStats()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load mobile app stats'));
  }, []);

  if (!data) {
    return (
      <Container>
        <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Mobile App' }]} />
        <LoadingSpinner />
      </Container>
    );
  }

  const { users, revenue, coins, recent_users: recentUsers } = data;

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Mobile App' }]} />
      <Title>Mobile App</Title>
      <Subtitle>
        Who uses the iOS app and what it has earned. A user counts once they make a signed-in
        request from the app; revenue is App Store coin-pack sales.
      </Subtitle>

      <GroupLabel>App users</GroupLabel>
      <GroupNote>Tracked from the app's own requests, so it includes people who turned notifications off.</GroupNote>
      <Tiles>
        <Tile>
          <TileLabel>App users</TileLabel>
          <TileValue $accent>{count(users.total)}</TileValue>
          <TileSub>{count(users.new_30d)} new in 30 days</TileSub>
        </Tile>
        <Tile>
          <TileLabel>Active, 7 days</TileLabel>
          <TileValue>{count(users.active_7d)}</TileValue>
        </Tile>
        <Tile>
          <TileLabel>Active, 30 days</TileLabel>
          <TileValue>{count(users.active_30d)}</TileValue>
        </Tile>
        <Tile>
          <TileLabel>Notifications on</TileLabel>
          <TileValue>{count(users.push_enabled)}</TileValue>
          <TileSub>registered for push</TileSub>
        </Tile>
      </Tiles>

      <GroupLabel>App Store revenue</GroupLabel>
      <GroupNote>Coin packs bought in the app, in baht before Apple's commission (15–30%), minus App Store refunds.</GroupNote>
      <Tiles>
        <Tile>
          <TileLabel>Net revenue</TileLabel>
          <TileValue $accent>{baht(revenue.net)}</TileValue>
          <TileSub>{baht(revenue.gross)} sold</TileSub>
        </Tile>
        <Tile>
          <TileLabel>Coin packs sold</TileLabel>
          <TileValue>{count(revenue.topups)}</TileValue>
        </Tile>
        <Tile>
          <TileLabel>Paying users</TileLabel>
          <TileValue>{count(revenue.buyers)}</TileValue>
        </Tile>
        <Tile>
          <TileLabel>Refunded</TileLabel>
          <TileValue>{baht(revenue.refunded)}</TileValue>
          <TileSub>{count(revenue.refunds)} refund{revenue.refunds === 1 ? '' : 's'}</TileSub>
        </Tile>
      </Tiles>

      <Panel>
        <GroupLabel>Net revenue by month</GroupLabel>
        <Suspense fallback={<LoadingSpinner />}>
          <RevenueChart data={revenue.months} emptyMessage="No App Store purchases yet." />
        </Suspense>
      </Panel>

      {revenue.packs.length > 0 && (
        <Panel>
          <GroupLabel>By coin pack</GroupLabel>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Pack</th>
                  <th className="num">Sold</th>
                  <th className="num">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenue.packs.map(pack => (
                  <tr key={pack.product_id}>
                    <td>{pack.product_id}</td>
                    <td className="num">{count(pack.sold)}</td>
                    <td className="num">{baht(pack.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </Panel>
      )}

      <GroupLabel>Coins</GroupLabel>
      <GroupNote>All coins, including sign-up bonuses and admin adjustments, not only App Store ones.</GroupNote>
      <Tiles>
        <Tile>
          <TileLabel>Spent on cheat sheets</TileLabel>
          <TileValue>{baht(coins.spent)}</TileValue>
          <TileSub>{count(coins.sheets)} sheet{coins.sheets === 1 ? '' : 's'}</TileSub>
        </Tile>
        <Tile>
          <TileLabel>Held by users</TileLabel>
          <TileValue>{baht(coins.held)}</TileValue>
          <TileSub>not spent yet</TileSub>
        </Tile>
      </Tiles>

      <Panel>
        <GroupLabel>App users</GroupLabel>
        <GroupNote>
          Most recently active first{users.total > recentUsers.length ? ` (latest ${recentUsers.length} of ${count(users.total)})` : ''}.
        </GroupNote>
        {recentUsers.length === 0 ? (
          <Empty>No one has used the app yet.</Empty>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Institution</th>
                  <th>First seen</th>
                  <th>Last seen</th>
                  <th>Notifications</th>
                  <th className="num">App Store spend</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user.user_id}>
                    <td>
                      <Person>
                        {user.avatar_url && <Avatar src={user.avatar_url} alt="" loading="lazy" />}
                        <div>
                          <div>{user.name}</div>
                          <Muted>{user.email}</Muted>
                        </div>
                      </Person>
                    </td>
                    <td>{user.institution || '—'}{user.year_level && <Muted> · {user.year_level}</Muted>}</td>
                    <td>{formatDate(user.app_first_seen_at)}</td>
                    <td>{timeAgo(user.app_last_seen_at)}</td>
                    <td>{user.push_enabled ? 'On' : <Muted>Off</Muted>}</td>
                    <td className="num">{user.app_spend ? baht(user.app_spend) : <Muted>—</Muted>}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Panel>
    </Container>
  );
}
